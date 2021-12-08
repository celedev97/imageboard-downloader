<template>
  <div>
    <el-container>
      <el-header>
        <h1>HDownloader v{{appVersion}}</h1>
      </el-header>
      <el-main>

        <el-tabs v-model="selectedTabId" type="card" editable @edit="handleTabsEdit">
          <el-tab-pane
            v-for="item in tabs" :key="item.id"
            :name="item.id"
            :label="item.component.name"
          >
            <component :is='item.component' />
          </el-tab-pane>
        </el-tabs>

      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue'
import { Vue } from 'vue-class-component'
import NHentai from '@/plugins/NHentai/NHentai.vue'
import Sankaku from '@/plugins/Sankaku/Sankaku.vue'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version



interface Tab {
  id: string;
  component:  Component;
}


export default class App extends Vue {
  selectedTabId = '0'
  tabs = [] as Tab[]

  appVersion = version

  created (): void {
    this.addTab()
    this.addTab(NHentai)
  }

  handleTabsEdit (targetName: string, action: string): void {
    if (action === 'add') {
      this.addTab()
    } else if (action === 'remove') {
      this.removeTab(targetName)
    }
  }
  addTab (component: any = Sankaku): void {
    this.tabs.push({
      id: String(this.tabs.length + 1),
      component: component
    })
    this.selectedTabId = String(this.tabs.length)
  }
  removeTab (targetID: string): void {
    let tabs = this.tabs

    if (tabs.length <= 1) return

    // fixing selected tab if necessary
    let activeName = this.selectedTabId
    if (activeName === targetID) {
      tabs.forEach((tab, index) => {
        if (tab.id === targetID) {
          let nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.id
          }
        }
      })
      this.selectedTabId = activeName
    }

    // removing the target tab
    this.tabs = tabs.filter(tab => {
      return tab.id !== targetID
    })

    console.log(this.tabs)
  }

}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
.el-header{
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  h1 {
    margin-top: 15px;
  }
}
main.el-main {
  padding: 3px;
}
.el-tabs__content {
  padding: 0 20px;
}
</style>
