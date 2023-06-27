import {createResource, For, Suspense} from "solid-js"
import {RepoListItem} from "./RepoListItem"
import styles from "./styles.module.css"



interface RepoListProps {
  githubUsername: string
}

export function RepoList(props: RepoListProps) {
  const [data] = createResource(props.githubUsername, fetchUserRepoList)

  return (
    <div class={styles.repolist}>
      <Suspense fallback={<>Fetching repos...</>}>
        <For each={data()}>
          {(repo) => (
              <RepoListItem repo={repo} githubUsername={props.githubUsername} />
          )}
        </For>
      </Suspense>
    </div>
  )
}



async function fetchUserRepoList(githubUsername: string) {
  const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=created`)
  const results = await response.json() as ResultItem[]

  return results.filter((result) => result.name != `${githubUsername.toLowerCase()}.github.io`)
}

// For type checking only
export type ResultItem = {
  name: string,
  html_url: string,
  description: string | null,
  has_pages: boolean
}
