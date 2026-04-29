import { NextResponse } from "next/server";

export async function POST() {
  try {
    const githubToken = process.env.GITHUB_ACTIONS_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const workflowId = process.env.GITHUB_WORKFLOW_ID ?? "screper-livelo.yml";
    const workflowRef = process.env.GITHUB_WORKFLOW_REF ?? "master";

    if (!githubToken || !repoOwner || !repoName) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing GitHub Actions env vars. Configure GITHUB_ACTIONS_TOKEN, GITHUB_REPO_OWNER and GITHUB_REPO_NAME.",
        },
        { status: 500 },
      );
    }

    const dispatchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowId}/dispatches`;
    const response = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: workflowRef,
        inputs: {
          force_alert: "true",
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to dispatch GitHub Action (${response.status})`,
          details: body.slice(-2000),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "github-actions",
      workflowId,
      workflowRef,
      repository: `${repoOwner}/${repoName}`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Scan trigger failed" },
      { status: 500 },
    );
  }
}
