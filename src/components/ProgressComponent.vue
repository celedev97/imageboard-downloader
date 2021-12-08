<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Download progress:</span>
      </div>
    </template>
    
    <el-alert v-if="showSuccess"
      type="success" show-icon :closable="false"
      title="Success" description="Download Complete"
    />

    <el-alert v-for="error in errors" :key="error"
      type="error" show-icon title="Error" :closable="false"
      :description="error"
    />

    <div class="text item" v-if="totalBytes>0">
      Current file <span class="half-hidden">({{`${downloadedBytes}/${totalBytes} bytes`}})</span>:
      <el-progress :percentage="fileProgress" :status="fileProgress==100 ? 'success': null"
        :text-inside="true" :stroke-width="26" :format="perc => ''"
      />
    </div>
    
    <div class="text item" v-if="totalFiles>0">
      Total progress <span class="half-hidden">({{`${downloadedFiles}/${totalFiles} files`}})</span>:
      <el-progress :percentage="taskProgress" :status="taskProgress==100 ? 'success': null"
        :text-inside="true" :stroke-width="26" :format="perc => '' "
      />
    </div>

  </el-card>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class ProgressComponent extends Vue {
  downloadedBytes = 0
  totalBytes = 0

  setFileProgress(downloaded: number, total: number): void {
    this.downloadedBytes = downloaded;
    this.totalBytes = total;
  }
  get fileProgress(): number{
    return Math.trunc(this.downloadedBytes * 100 / this.totalBytes)
  }

  downloadedFiles = 0
  totalFiles = 0
  setTaskProgress(downloaded: number, total: number): void {
    this.downloadedFiles = downloaded;
    this.totalFiles = total
  }
  get taskProgress (): number{
    return Math.trunc(this.downloadedFiles * 100 / this.totalFiles)
  }

  showSuccess = false
  success(){ this.showSuccess = true }
  errors: string[] = []

  clear(): void{
    this.showSuccess = false
    this.errors = []

    this.downloadedBytes = 0
    this.downloadedFiles = 0

    this.totalBytes = 0
    this.totalFiles = 0
  }

}
</script>

<style scoped lang="scss">
.half-hidden {
  font-size: 12px;
  color: darkgrey;
}
</style>