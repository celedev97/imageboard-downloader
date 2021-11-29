import axiosOriginal from 'axios'
import { downloadFile } from '@/helpers/requestHelper'

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

export interface SankakuPostRequest {
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

const axios = axiosOriginal.create({
  baseURL: 'https://capi-v2.sankakucomplex.com/',
  // timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'
  }
})

export interface downloadOptions{
  folder: string
  inDownloadDelay?: number
  taskProgressCallback?: ((downloaded_files: number, total_files: number) => void)
  fileProgressCallback?: ((received_bytes: number, total_bytes: number) => void)
}

export default {

  autoSuggest (queryString: string): Promise<Suggestion[]> {
    return new Promise(function (resolve, reject) {
      let search = queryString.split(' ').pop()
      if (search === undefined) search = ''
      console.log(`asked for: '${search}'`)
      if (search.trim().length === 0) {
        // TODO: in questo caso controlla i tag correlati agli ultimi tags?lang=en&related=dross+traps
        const empty: Suggestion[] = []
        resolve(empty)
        return
      }
      axios.get<Suggestion[]>(`tags/autosuggestCreating?&tag=${search}`).then(response => {
        console.log(response.data)

        //finding the old query without the new suggested part
        const tags = queryString.split(' ')
        tags.pop()
        const partialQuery = tags.join(' ')

        //adding the full query to the suggestions (necessary for the autocomplete)
        response.data.forEach(element => {
          element.fullQuery = `${partialQuery} ${element.name} `.trimStart()
        })

        resolve(response.data)
      }).catch(reason => reject(reason))
    })
  },

  getPosts (query: string , next = ''): Promise<Post[]> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const api = this
    return new Promise(function (resolve, reject) {
      const posts: Post[] = [];

      axios.get<SankakuPostRequest>(`posts/keyset?limit=100&tags=${encodeURIComponent(query)}&next=${next}`).then(response => {
        const meta = response.data.meta
        const newPosts = response.data.data
        console.log()
        posts.push(...newPosts)
        // recursive approach, if there's a next page i call the function again
        if (meta.next != null) {
          api.getPosts(query, meta.next).then(
              nextPosts => {
                posts.push(...nextPosts)
                resolve(posts)
              }
          )
        } else {
          resolve(posts)
        }
      }).catch(reason => reject(reason))
    })
  },

  async downloadPosts (posts: Post[], options: downloadOptions): Promise<void> {
    const total = posts.length
    const validPosts = posts.filter((post) => post.file_url)
    for (let index = 0; index < validPosts.length; index++) {
      console.log("downloading")
      console.log(validPosts[index])
      await downloadFile(validPosts[index].file_url, options.folder, options.fileProgressCallback)
      if(options.taskProgressCallback) options.taskProgressCallback(index+1, total)
      if(options.inDownloadDelay) await new Promise(resolve => setTimeout(resolve, options.inDownloadDelay));
    }
  },

}
