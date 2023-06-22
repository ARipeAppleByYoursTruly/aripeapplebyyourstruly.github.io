import {createResource, Show, For, Suspense} from "solid-js"



interface RepoListProps {
  githubUsername: string
}

export function RepoList(props: RepoListProps) {
  const [data] = createResource(props.githubUsername, fetchUserRepoList)

  return (
    <Suspense fallback={<>Loading...</>}>
      <ul>
        <For each={data()}>
          {(repo) => (
            // <Show when={repo.name != "aripeapplebyyourstruly.github.io"}>
            //   <li><a href={repo.html_url}>{repo.name}</a></li>
            // </Show>
            <li>asd</li>
          )}
        </For>
      </ul>
    </Suspense>
  )
}



async function fetchUserRepoList(githubUsername: string) {
  const response = await fetch(`https://api.github.com/users/${githubUsername}/repos`)
  const results = await response.json() as ResultItem[]

  return createRepoList(results, githubUsername)
}

// For type checking only
type ResultItem = {
  name: string,
  html_url: string,
  description: string | null,
  has_pages: boolean
}



async function createRepoList(results: ResultItem[], githubUsername: string): Promise<RepoListItem[]> {
  let rawContentUrl = `https://raw.githubusercontent.com/${githubUsername}`
  let repoList = [] as RepoListItem[]

  // Seems slow even for just 6 repos
  // ===
  // for (const result of results) {
  //   if (result.name == `${githubUsername.toLowerCase()}.github.io`) {
  //     continue
  //   }

  //   let urlToFolder = `${rawContentUrl}/${result.name}/main/for-personal-website`

  //   let repoListItem = {
  //     name: result.name,
  //     url: result.html_url,
  //     description: result.description,
  //     thumbnail_url: null
  //   } as RepoListItem

  //   if (result.has_pages) {
  //     const hasPagesResponse = await fetch(`${urlToFolder}/pages-url.txt`)
  //     repoListItem.url = (await hasPagesResponse.text()).trim()
  //     console.log(repoListItem)
  //   }


  //   let thumbnail_url = `${urlToFolder}/thumbnail.url`
  //   const thumbnailResponse = await fetch(thumbnail_url)

  //   if (thumbnailResponse.ok) {
  //     repoListItem.thumbnail_url = thumbnail_url
  //   }


  //   repoList.push(repoListItem)
  // }

  // return repoList


  // Better, but I realized that this can be handled by each card render, instead of trying to handle it when fetching
  // let filteredResults = results.filter((result) => result.name != `${githubUsername.toLowerCase()}.github.io`)

  // return await Promise.all(filteredResults.map(async (result): Promise<RepoListItem> => {
  //   let urlToFolder = `${rawContentUrl}/${result.name}/main/for-personal-website`

  //   let repoListItem = {
  //     name: result.name,
  //     url: result.html_url,
  //     description: result.description,
  //     thumbnail_url: null
  //   } as RepoListItem

  //   if (result.has_pages) {
  //     const hasPagesResponse = await fetch(`${urlToFolder}/pages-url.txt`)
  //     repoListItem.url = (await hasPagesResponse.text()).trim()
  //     console.log(repoListItem)
  //   }

  //   let thumbnail_url = `${urlToFolder}/thumbnail.url`
  //   const thumbnailResponse = await fetch(thumbnail_url)

  //   if (thumbnailResponse.ok) {
  //     repoListItem.thumbnail_url = thumbnail_url
  //   }

  //   return repoListItem
  // }))
}

type RepoListItem = {
  name: string,
  url: string,
  description: string | null,
  thumbnail_url: string | null
}
