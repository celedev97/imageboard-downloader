<template>
  <el-form @submit.prevent label-position="top">

    <el-form-item label="Tags:" ref="queryInput">
      <el-autocomplete v-model="query"
                       placeholder="Search"
                       value-key="name"
                       :fetch-suggestions="getSuggestions"
                       @select="selectSuggestion"
      ></el-autocomplete>
    </el-form-item>

    <el-form-item label="Download Folder:">
      <div style="display: flex">
        <el-input v-model="downloadFolder"></el-input>
        <el-button style="margin-left: 15px" type="primary" @click="selectDir">Browse <el-icon class="el-icon--right"><icon-view /></el-icon></el-button>
      </div>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="download">Download <el-icon class="el-icon--right"><icon-view /></el-icon></el-button>
    </el-form-item>

    <el-progress :percentage="fileProgress" />
    <el-progress :percentage="taskProgress" />

  </el-form>
</template>

<script lang="ts">
import SankakuApi, { Suggestion } from './SankakuApi'

import Electron from 'electron'

import { BrowserWindow, dialog } from '@electron/remote'
import { Options, Vue } from 'vue-class-component'

let global_uuid = 0;

@Options({
  name: "Sankaku"
})
export default class Sankaku extends Vue {
  name = 'Sankaku'
  query = ''
  downloadFolder = ''

  fileProgress = 0
  taskProgress = 0

  uuid = ''

  mounted(): void {
    this.uuid = (global_uuid++).toString();
  }
  

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

  selectDir(): void {
    dialog.showOpenDialog({properties: ['openDirectory']}).then( response =>{
      if(!response.canceled) this.downloadFolder = response.filePaths[0]
    });
  }

  download (): void {
    let query = this.query.trim()
    if (query.length === 0) return

    // finding posts
    SankakuApi.getPosts(query).then(posts =>
      SankakuApi.downloadPosts(posts, {
        folder: this.downloadFolder, 
        inDownloadDelay: 1000, 
        fileProgressCallback: this.updateFileDownloadStatus,
        taskProgressCallback: this.updateTaskDownloadStatus,
      })
    ).catch((reason:any) =>
      console.log(reason)
    )
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
