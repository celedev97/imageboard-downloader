<template>
  <el-form @submit.prevent label-position="top" :disabled="!downloadEnabled">

    <el-form-item label="Tags:" ref="queryInput">
      <el-autocomplete v-model="query" placeholder="Search"
                       value-key="name"
                       :fetch-suggestions="getSuggestions"
                       @select="selectSuggestion"
      ></el-autocomplete>
    </el-form-item>

    <folder-select v-model="downloadFolder"></folder-select>

    <el-form-item>
      <el-button type="primary" @click="download">
        Download
      </el-button>
    </el-form-item>

    <progress-component ref="progress" />

  </el-form>
</template>

<script lang="ts">
import SankakuApi, { Suggestion } from './SankakuApi'


import { Options, Vue } from 'vue-class-component'

import FolderSelect from '@/components/FolderSelect.vue'
import ProgressComponent from '@/components/ProgressComponent.vue'


@Options({
  name: "Sankaku",
  components: {
    FolderSelect,
    ProgressComponent
  }
})
export default class Sankaku extends Vue {
  query = ''
  downloadFolder = ''
  downloadEnabled = true; 

  get progress(): ProgressComponent{
    return (this.$refs.progress as ProgressComponent)
  }

  // #region AutoSuggest
  // this get called each time the text get changed
  getSuggestions (_: string, callback: (suggestions: Suggestion[]) => void): void {
    SankakuApi.autoSuggest(this.query).then((suggestions) => callback(suggestions))
  }

  selectSuggestion (item: Suggestion): void {
    this.query = item.fullQuery as string
    (this.$refs.queryInput as any).$el.getElementsByTagName('input')[0].focus();
  }
  // #endregion

  async download (): Promise<void> {
    this.downloadEnabled = false

    let query = this.query.trim()
    if (query.length === 0) {
      this.downloadEnabled = true
      return
    }

    //TODO: add a check for the downloadFolder, it should be confirmed that it's really a folder

    try {
      // finding posts
      const posts = await SankakuApi.getPosts(query, posts => this.progress.totalFiles = posts )
    
      //downloading posts
      await SankakuApi.downloadPosts(posts, {
        folder: this.downloadFolder, 
        inDownloadDelay: 500, 
        fileProgressCallback: (downloaded, total) => {
          this.progress.downloadedBytes = downloaded;
          this.progress.totalBytes = total;
        },
        taskProgressCallback: (downloaded, total) => {
          this.progress.downloadedFiles = downloaded;
          this.progress.totalFiles = total
        }
      })
      this.downloadEnabled = true

    } catch (error) {
      //TODO: communicate the error to the user
      console.log(error)
      this.downloadEnabled = true
      return 
    }
  }

}
</script>

<style lang="scss">
.el-autocomplete {
  width: 100%;
}
</style>
