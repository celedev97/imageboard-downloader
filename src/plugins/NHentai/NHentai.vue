<template>
  <el-form @submit.prevent label-position="top" :disabled="!downloadEnabled">

    <el-form-item label="Link or code:" ref="queryInput">
      <el-input v-model="query" placeholder="Search"></el-input>
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
import NHentaiApi from './NHentaiApi'


import fs from 'fs'

import { Options, Vue } from 'vue-class-component'

import FolderSelect from '@/components/FolderSelect.vue'
import ProgressComponent from '@/components/ProgressComponent.vue'


@Options({
  name: "NHentai",
  components: {
    FolderSelect,
    ProgressComponent
  }
})
export default class NHentai extends Vue {
  query = ''
  downloadFolder = ''
  downloadEnabled = true; 

  get progress(): ProgressComponent{
    return (this.$refs.progress as ProgressComponent)
  }

  async download (): Promise<void> {
    this.progress.clear()

    let regexResult = this.query.match(/([0-9]+)/gm)
    let query = regexResult ? regexResult[0] : '';

    //skipping if query is empty
    if (query.length === 0) {
      this.progress.errors.push("The query is not valid, copy a link from nhentai please")
      return
    }

    //checking if the folder exists
    if(!fs.existsSync(this.downloadFolder)){
      this.progress.errors.push("The selected download folder does not exists")
      return
    }

    this.downloadEnabled = false
    try {
      // finding images
      const images = await NHentaiApi.getImages(query)

      await NHentaiApi.downloadImages(images, {
        folder: this.downloadFolder,
        inDownloadDelay: 250, 
        fileProgressCallback: this.progress.setFileProgress,
        taskProgressCallback: this.progress.setTaskProgress,
      })

      
      this.progress.success()

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
