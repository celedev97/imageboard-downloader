<template>
  <el-form @submit.prevent label-position="top" :disabled="!downloadEnabled">

    <el-form-item label="Tags:" ref="queryInput">
      <el-autocomplete v-model="query"
                       placeholder="Search"
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

    <el-progress :percentage="fileProgress" />
    <el-progress :percentage="taskProgress" />

  </el-form>
</template>

<script lang="ts">
import SankakuApi, { Suggestion } from './SankakuApi'


import { dialog } from '@electron/remote'
import { Options, Vue } from 'vue-class-component'

import FolderSelect from '@/components/FolderSelect.vue'


@Options({
  name: "Sankaku",
  components: {
    FolderSelect
  }
})
export default class Sankaku extends Vue {
  query = ''
  downloadFolder = ''

  fileProgress = 0
  taskProgress = 0

  downloadEnabled = true; 

  // region AutoSuggest
  // this get called each time the text get changed
  getSuggestions (_: string, callback: (suggestions: Suggestion[]) => void): void {
    SankakuApi.autoSuggest(this.query).then((suggestions) => callback(suggestions))
  }

  selectSuggestion (item: Suggestion): void {
    this.query = item.fullQuery as string
    (this.$refs.queryInput as any).$el.getElementsByTagName('input')[0].focus();
  }
  // endregion

  download (): void {
    this.downloadEnabled = false

    let query = this.query.trim()
    if (query.length === 0) {
      this.downloadEnabled = true
      return
    }

    //TODO: add a check for the downloadFolder, it should be confirmed that it's really a folder

    // finding posts
    SankakuApi.getPosts(query).then(posts =>
      SankakuApi.downloadPosts(posts, {
        folder: this.downloadFolder, 
        inDownloadDelay: 1000, 
        fileProgressCallback: this.updateFileDownloadStatus,
        taskProgressCallback: this.updateTaskDownloadStatus,
      }).then( () =>{
        this.downloadEnabled = true
      }).catch((reason) =>{
        //TODO: communicate the error to the user
        console.log(reason)
        this.downloadEnabled = true; 
      })
    ).catch((reason) =>{
      //TODO: communicate the error to the user
      console.log(reason)
      this.downloadEnabled = true; 
    })
    // downloading posts
  }

  updateFileDownloadStatus(downloaded: number, total: number) : void{
    this.fileProgress = Math.trunc(downloaded * 100 / total)
  }

  updateTaskDownloadStatus(downloaded: number, total: number) : void{
    this.taskProgress = Math.trunc(downloaded * 100 / total)
  }

}
</script>

<style lang="scss">
.el-autocomplete {
  width: 100%;
}
</style>
