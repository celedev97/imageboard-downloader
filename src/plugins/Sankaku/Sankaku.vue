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


import fs from 'fs'

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
    this.progress.clear()

    let query = this.query.trim()

    //skipping if query is empty
    if (query.length === 0) {
      this.progress.errors.push("The query is empty")
      return
    }

    //checking if the folder exists
    if(!fs.existsSync(this.downloadFolder)){
      this.progress.errors.push("The selected download folder does not exists")
      return
    }

    this.downloadEnabled = false
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
      this.progress.success = "Files downloaded."

    } catch (error) {
      this.progress.errors.push(error as string)
    }
    this.downloadEnabled = true
  }

}
</script>

<style lang="scss">
.el-autocomplete {
  width: 100%;
}
</style>
