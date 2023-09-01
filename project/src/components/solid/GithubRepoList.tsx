import {createResource, Suspense, For, Show} from "solid-js"



type Result = {
  name: string,
  html_url: string,
  description: string | null,
  has_pages: boolean
}



export default function GithubRepoList(props: {
  githubUsername: string
}) {
  const [repos] = createResource(async () => {
    const response = await fetch(`https://api.github.com/users/${props.githubUsername}/repos?sort=created`)
    const results = await response.json() as Result[]

    return results.filter((result) => {
      return result.name !== `${props.githubUsername.toLowerCase()}.github.io`
    })
  })



  return (
    <div
      class="
        display:grid
        grid-template-columns:repeat(auto-fit,minmax(330px,1fr))
        grid-gap:20px

        margin:0_10px
        text-align:center
      "
    >
      <Suspense fallback={<>Fetching repos...</>}>
        <For each={repos()}>
          {(repo) => {
            return (
              <GithubRepoListItem
                githubUsername={props.githubUsername}
                repo={repo}
              />
            )
          }}
        </For>
      </Suspense>
    </div>
  )
}



type RepoInfo = {
  formalName: string,
  pagesUrl: string
}



function GithubRepoListItem(props: {
  githubUsername: string,
  repo: Result
}) {
  const urlToFolder = `https://raw.githubusercontent.com/${props.githubUsername}/${props.repo.name}/main/for-personal-website`

  const [repoInfo] = createResource(async (): Promise<RepoInfo> => {
    const response = await fetch(`${urlToFolder}/repo-info.json`)

    if (response.ok) {
      return response.json()
    }
    else {
      return {} as RepoInfo
    }
  })

  const [thumbnail] = createResource(async () => {
    const response = await fetch(`${urlToFolder}/thumbnail.webp`)

    if (response.ok) {
      return response.url
    }
    else {
      return "/images/no thumbnail.webp"
    }
  })



  return (
    <a
      href={repoInfo()?.pagesUrl !== undefined ?
        repoInfo()?.pagesUrl :
        props.repo.html_url
      }
      class="
        link-text

        real-hover!background-color:var(--backgroundOnHover)
        :focus-visible?background-color:var(--backgroundOnHover)
        :active?background-color:var(--backgroundOnClick)

        border:2px_solid_var(--accent)
        border-radius:20px
        real-hover!border-color:var(--accentOnHover)
        :focus-visible?border-color:var(--accentOnHover)
        :active?border-color:var(--accentOnClick)

        outline-offset:0
        :focus-visible?outline-width:5px

        padding:20px

        apply-transition
        transition-property:color,background-color,border
      "
    >
      <img
        loading="lazy"
        decoding="async"
        src={thumbnail()}
        alt={`Thumbnail image for GitHub repo ${props.githubUsername}/${props.repo.name}`}
        class="
          width:100%
          height:200px
          margin-bottom:10px

          object-fit:contain
        "
      />
      <div
        class="
          padding-bottom:15px

          font-weight:bold
          font-size:1.1rem
        "
      >
          <Show
            when={repoInfo()?.formalName !== undefined}
            fallback={props.repo.name}
          >
            {repoInfo()?.formalName}
          </Show>
      </div>
      <div
        class="
          font-size:.95rem
        "
      >
        <Show
          when={props.repo.description !== null}
          fallback={"No description given"}
        >
          {props.repo.description}
        </Show>
      </div>
    </a>
  )
}
