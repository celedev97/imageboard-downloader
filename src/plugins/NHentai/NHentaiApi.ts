import { downloadString, DownloadOptions, downloadFile } from "@/helpers/requestHelper"

import { parse } from 'node-html-parser';


interface NHentaiImages{
  page_url: string
  supposed_file_url: string
  file_url: string | null
}

const HOST = 'nhentai.net'
const SITE = `https://${HOST}/`

export default{

  async fetchImageFromPageLink(pageLink:string): Promise<string>{
    return parse(await downloadString(pageLink)). 
      querySelector('#image-container img')?.
      getAttribute('src') as string
  },

  async getImages(galleryCode:string): Promise<NHentaiImages[]>{
    //getting all the pagelinks
    const galleryPage = parse(await downloadString(`${SITE}/g/${galleryCode}`))    
    let pageLinks = galleryPage.querySelectorAll(".gallerythumb").map(it => it.getAttribute("href") as string)

    //making the pagelinks global
    pageLinks = pageLinks.map(link => link.startsWith('/') ? SITE + link.substring(1) : link)

    //cleaning the pagelinks ending /
    pageLinks = pageLinks.map(link => link.endsWith('/') ? link.substring(0, link.length-1) : link)

    //getting the file url of the first pagelinks
    const firstFileUrl = await this.fetchImageFromPageLink(pageLinks[0])

    const output: NHentaiImages[] = pageLinks.map(link => {
      return {
        page_url: link,
        supposed_file_url: firstFileUrl.replace('1.jpg', link.split('/').pop() + ".jpg"),
        file_url: null,
      }
    })

    return output
  },

  async downloadImages(images: NHentaiImages[], options: DownloadOptions): Promise<void>{
    const total = images.length
    for (let index = 0; index < total; index++) {
      try {
        await downloadFile(images[index].supposed_file_url, options)
      } catch (error) {
        images[index].file_url = await this.fetchImageFromPageLink(images[index].page_url)
        await downloadFile(images[index].file_url as string, options)
      }
      
      if(options.taskProgressCallback) options.taskProgressCallback(index+1, total)
    }
  }

}