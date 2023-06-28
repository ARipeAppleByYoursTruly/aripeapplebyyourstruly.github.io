import {createResource, Suspense, Show} from "solid-js"
import {ResultItem} from "./RepoList"
import styles from "./styles.module.css"



interface RepoListItemProps {
  repo: ResultItem,
  githubUsername: string
}

export function RepoListItem(props: RepoListItemProps) {
  const urlToFolder = `https://raw.githubusercontent.com/${props.githubUsername}/${props.repo.name}/main/for-personal-website`
  const [pagesUrl] = createResource({repo: props.repo, urlToFolder: urlToFolder}, fetchRepoPagesUrl)
  const [thumbnail] = createResource(urlToFolder, fetchRepoThumbnail)

  return (
    <Suspense fallback={<div class={styles["repolist-item"]}>Loading...</div>}>
      <a href={pagesUrl()} class={styles["repolist-item"]}>
        <div class={styles["image-container"]}>
          <img src={thumbnail()} alt={`Thumbnail image for ${props.githubUsername}'s ${props.repo.name} repository`}/>
        </div>
        <div class={styles["title"]}>{shortenRepoName(props.repo.name)}</div>
        <Show when={props.repo.description != ""}>
          <div class={styles["description"]}>{props.repo.description}</div>
        </Show>
      </a>
    </Suspense>
  )
}



async function fetchRepoPagesUrl(args: {repo: ResultItem, urlToFolder: string}) {
  if (!args.repo.has_pages) {
    return args.repo.html_url
  }

  const response = await fetch(`${args.urlToFolder}/pages-url.txt`)

  if (response.ok) {
    return (await response.text()).trim()
  }
  else {
    return args.repo.html_url
  }
}



async function fetchRepoThumbnail(urlToFolder: string) {
  const thumbnailUrl = `${urlToFolder}/thumbnail.webp`
  const response = await fetch(thumbnailUrl)

  if (response.ok) {
    return thumbnailUrl
  }
  else {
    return "/images/no-thumbnail-placeholder.webp"
  }
}



function shortenRepoName(name: string): string {
  if (name.length <= 30) {
    return name
  }

  return name.substring(0, 27) + "..."
}
