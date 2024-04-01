import fs from "node:fs"



export default async function main({github, context}) {
  const ownerName = context.repo.owner
  const repoName = context.repo.repo



  // Get repos that I want to track as other stuff
  const {repoData_otherStuff_input} = (() => {
    let jsonFile

    try {
      jsonFile = fs.readFileSync("./repoData/input.json", "utf-8")
    }
    catch (error) {
      throw new Error("repoData/input.json not found")
    }

    return JSON.parse(jsonFile)
  })()



  // Get user's list of repos
  const repoList = await (async () => {
    const repoList_response = await github.rest.repos.listForUser({
      username: ownerName,
      sort: "pushed",
      per_page: 100
    })

    if (repoList_response.status !== 200) {
      throw new Error("repoList_response.status is not 200")
    }
    else {
      return repoList_response.data
    }
  })()



  // Get repoData
  const repoData = (() => {
    let jsonFile

    try {
      jsonFile = fs.readFileSync("./repoData/output.json", "utf-8")
    }
    catch (error) {
      // File doesn't exist, repoData will be empty
      return {
        hundredPercentGuides: [],
        otherStuff: []
      }
    }

    // File exists, repoData will use existing values as base
    return JSON.parse(jsonFile)
  })()



  // Generate repoData for 100% guides
  // To be implemened when I've started making 100% guides



  // Generate repoData for other stuff
  for (const inputRepoName of repoData_otherStuff_input) {
    // Find the repo in repoList
    const repo_found = repoList.find((repo) => {
      return repo.name === inputRepoName
    })

    // Stale repos will not be updated
    if (repo_found === undefined) {
      continue
    }



    // Replace url_html with the url to GitHub Pages if the repo has Pages
    let url_html = repo_found.html_url

    if (repo_found.has_pages) {
      url_html = `https://aripeapplebyyourstruly.github.io/${inputRepoName}`
    }



    // Get url of thumbnail if it exists
    let url_thumbnail = await (async () =>{
      const url = `https://raw.githubusercontent.com/${ownerName}/${inputRepoName}/` +
        "for-personal-website/thumbnail.webp"

      const response = await fetch(url)

      if (response.ok) {
        return url
      }
      else {
        return ""
      }
    })()



    // Update repoData
    const inputRepoData = {
      name: inputRepoName,
      description: repo_found.description,
      pushed_at: repo_found.pushed_at,
      url_html: url_html,
      url_thumbnail: url_thumbnail
    }



    const repoData_repo_found_index = repoData.otherStuff.findIndex((repo) => {
      return repo.name === inputRepoName
    })

    if (repoData_repo_found_index > -1) {
      repoData.otherStuff[repoData_repo_found_index] = inputRepoData
    }
    else {
      repoData.otherStuff.push(inputRepoData)
    }
  }



  // Sort repoData by pushed_at
  repoData.otherStuff.sort((a, b) => {
    return b.pushed_at.localeCompare(a.pushed_at)
  })



  // Get `repoData/output.json`'s SHA if it exists
  let repoData_sha = await (async () => {
    try {
      const response = await github.rest.repos.getContent({
        owner: ownerName,
        repo: repoName,
        path: "repoData/output.json"
      })

      if (response.status === 200) {
        return response.data.sha
      }
    }
    catch (error) {
      return ""
    }
  })()



  // Write repoData to file
  const outputArguments = {
    owner: ownerName,
    repo: repoName,
    path: "repoData/output.json",
    message: "Create `repoData/output.json`",
    content: btoa(JSON.stringify(repoData, null, 2))
  }

  if (repoData_sha !== "") {
    outputArguments.sha = repoData_sha
    outputArguments.message = "Update `repoData/output.json`"
  }

  github.rest.repos.createOrUpdateFileContents(outputArguments)
}
