import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Artifact
 * {
      "id": 268569703,
      "node_id": "MDg6QXJ0aWZhY3QyNjg1Njk3MDM=",
      "name": "builds",
      "size_in_bytes": 93695030,
      "url": "https://api.github.com/repos/skullcandyinc/skullhq-desktop/actions/artifacts/268569703",
      "archive_download_url": "https://api.github.com/repos/skullcandyinc/skullhq-desktop/actions/artifacts/268569703/zip",
      "expired": false,
      "created_at": "2022-06-13T17:29:40Z",
      "updated_at": "2022-06-13T17:29:41Z",
      "expires_at": "2022-09-11T17:29:15Z",
      "workflow_run": {
        "id": 2490021128,
        "repository_id": 485844448,
        "head_repository_id": 485844448,
        "head_branch": "master",
        "head_sha": "365a5d9afdca51d1b846454bc44a572a08e91b7f"
      }
    }
 */

async function run() {
  try {
    const githubToken = core.getInput('token')
    const branchRef = core.getInput('branch-ref')

    const octokit = github.getOctokit(githubToken)

    const {data: repoArtifacts} =
      await octokit.rest.actions.listArtifactsForRepo({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
      })

    repoArtifacts.artifacts.forEach(artifact => {
      core.info(JSON.stringify(artifact))
    })

    const branchArtifacts = repoArtifacts.artifacts.filter(artifact =>
      [
        artifact.workflow_run?.head_branch,
        artifact.workflow_run?.head_sha
      ].includes(branchRef)
    )

    if (branchArtifacts.length) {
      await Promise.all(
        branchArtifacts.map(artifact =>
          octokit.rest.actions.deleteArtifact({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            artifact_id: artifact.id
          })
        )
      )
      core.info(
        `Successfully deleted ${branchArtifacts.length} artifacts from ${branchRef}`
      )
    } else {
      core.info(`There were no artifacts to delete from ${branchRef}`)
    }
  } catch (error) {
    console.error(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
