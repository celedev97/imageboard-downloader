import { downloadFile, downloadJSON } from '@/helpers/requestHelper'

// #region Sankaku API Data Definitions
export interface Meta {
  next: string;
  prev?: string;
}

export interface Author {
  id: number;
  name: string;
  avatar: string;
  avatar_rating: string;
}

export interface CreatedAt {
  json_class: string;
  s: number;
  n: number;
}

export interface Tag {
  id: number;
  name_en: string;
  name_ja: string;
  type: number;
  count: number;
  post_count: number;
  pool_count: number;
  locale: string;
  rating: string;
  version?: number;
  name: string;
}

export interface Post {
  id: number;
  rating: string;
  status: string;
  author: Author;
  sample_url: string;
  sample_width: number;
  sample_height: number;
  preview_url: string;
  preview_width: number;
  preview_height: number;
  file_url: string;
  width: number;
  height: number;
  file_size: number;
  file_type: string;
  created_at: CreatedAt;
  has_children: boolean;
  has_comments: boolean;
  has_notes: boolean;
  is_favorited: boolean;
  user_vote?: any;
  md5: string;
  parent_id?: number;
  change: number;
  fav_count: number;
  recommended_posts: number;
  recommended_score: number;
  vote_count: number;
  total_score: number;
  comment_count?: number;
  source: string;
  in_visible_pool: boolean;
  is_premium: boolean;
  is_rating_locked: boolean;
  redirect_to_signup: boolean;
  sequence?: any;
  tags: Tag[];
}

export interface SankakuSearchResult {
  meta: Meta;
  data: Post[];
}

export interface Suggestion {
  id: number;
  name: string;
  name_en: string;
  name_ja: string;
  type: number;
  count: number;
  post_count: number;
  pool_count: number;
  fullQuery: string | null;
}
// #endregion


export interface downloadOptions{
  folder: string
  inDownloadDelay?: number
  taskProgressCallback?: ((downloaded_files: number, total_files: number) => void)
  fileProgressCallback?: ((received_bytes: number, total_bytes: number) => void)
}

const API = 'https://capi-v2.sankakucomplex.com/'

export default {

  autoSuggest (queryString: string): Promise<Suggestion[]> {
    return new Promise(function (resolve, reject) {
      // pulizia stringa
      let search = queryString.split(' ').pop()
      if (search === undefined) search = ''
      
      console.log(`asking for {${search}}:`)

      //scelta della query da usare (completamento/correlati)
      let apiCall = `${API}tags/autosuggestCreating?&tag=${search}`
      if (search.trim().length === 0) {
        apiCall = `${API}tags?lang=en&related=${encodeURIComponent(queryString)}`
      }

      downloadJSON<Suggestion[]>(apiCall).then(suggestions => {
        console.log(suggestions)

        //finding the old query without the new suggested part
        const tags = queryString.split(' ')
        tags.pop()
        const partialQuery = tags.join(' ')

        //adding the full query to the suggestions (necessary for the autocomplete)
        suggestions.forEach(element => {
          element.fullQuery = `${partialQuery} ${element.name} `.trimStart()
        })

        resolve(suggestions)
      }).catch(reason => reject(reason))
    })
  },

  async getPosts (query: string, callback: ((posts:number) => void) | null = null): Promise<Post[]> {
    let metaNext = ''
    const posts: Post[] = []
    
    do{
      //doing the query
      const result = await downloadJSON<SankakuSearchResult>(
        `${API}posts/keyset?limit=100&tags=${encodeURIComponent(query)}&next=${metaNext}`
      ).catch(e => { throw e })

      //extracting the data from the result
      metaNext = result.meta.next
      posts.push(...result.data)

      //calling the callback
      if(callback) callback(posts.length)
    }while(metaNext != null);

    return posts
  },

  async downloadPosts (posts: Post[], options: downloadOptions): Promise<void> {
    posts = posts.filter((post) => post.file_url)
    const total = posts.length
    for (let index = 0; index < total; index++) {
      await downloadFile(posts[index].file_url, options.folder, options.fileProgressCallback)
      if(options.taskProgressCallback) options.taskProgressCallback(index+1, total)
      if(options.inDownloadDelay) await new Promise(resolve => setTimeout(resolve, options.inDownloadDelay));
    }
  },

}
