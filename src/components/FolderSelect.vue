<template>
  <el-form-item label="Download Folder:">
    <div style="display: flex">
      <el-input v-model="downloadFolder"></el-input>
      <el-button style="margin-left: 15px" type="primary" @click="selectDir">
        Browse
      </el-button>
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { dialog } from '@electron/remote'

import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

@Options({
  name: "FolderSelect",
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
})
export default class FolderSelect extends Vue {
  @Prop(String) modelValue!: string
  

  get downloadFolder () : string {
    return this.modelValue;
  }
  set downloadFolder (val: string) {
    this.$emit('update:modelValue', val);
  }


  selectDir(): void {
    dialog.showOpenDialog({properties: ['openDirectory']}).then( response =>{
      if(!response.canceled) this.downloadFolder = response.filePaths[0]
    });
  }
}
</script>

<style lang="scss">

</style>