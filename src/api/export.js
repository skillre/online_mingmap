import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

export const exportService = {
  // 导出为PNG图片
  async exportToPNG(element, filename = 'mindmap.png') {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高图片质量
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      })
      
      canvas.toBlob((blob) => {
        saveAs(blob, filename)
      }, 'image/png')
      
      return true
    } catch (error) {
      console.error('导出PNG失败:', error)
      throw new Error('导出PNG图片失败')
    }
  },
  
  // 导出为JPEG图片
  async exportToJPEG(element, filename = 'mindmap.jpg') {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      })
      
      canvas.toBlob((blob) => {
        saveAs(blob, filename)
      }, 'image/jpeg', 0.9)
      
      return true
    } catch (error) {
      console.error('导出JPEG失败:', error)
      throw new Error('导出JPEG图片失败')
    }
  },
  
  // 导出为SVG
  exportToSVG(svgElement, filename = 'mindmap.svg') {
    try {
      // 获取SVG内容
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      
      // 创建下载链接
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('导出SVG失败:', error)
      throw new Error('导出SVG图片失败')
    }
  },
  
  // 导出为MindMap格式（JSON）
  exportToMindMap(mindMapData, filename = 'mindmap.mmap') {
    try {
      const mindMapContent = {
        version: '1.0.0',
        format: 'mindmap',
        data: mindMapData,
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          exported_by: 'Online MindMap'
        }
      }
      
      const jsonContent = JSON.stringify(mindMapContent, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('导出MindMap失败:', error)
      throw new Error('导出MindMap文件失败')
    }
  },
  
  // 导出为FreeMind格式
  exportToFreeMind(mindMapData, filename = 'mindmap.mm') {
    try {
      const freeMindXML = this.convertToFreeMindXML(mindMapData)
      const blob = new Blob([freeMindXML], { type: 'application/xml' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('导出FreeMind失败:', error)
      throw new Error('导出FreeMind文件失败')
    }
  },
  
  // 导出为XMind格式
  exportToXMind(mindMapData, filename = 'mindmap.xmind') {
    try {
      // XMind格式比较复杂，这里简化处理
      // 实际项目中可能需要使用专门的库
      const xmindContent = {
        version: '2020',
        theme: 'default',
        structure: mindMapData,
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      const jsonContent = JSON.stringify(xmindContent, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('导出XMind失败:', error)
      throw new Error('导出XMind文件失败')
    }
  },
  
  // 导出为文本大纲
  exportToTextOutline(mindMapData, filename = 'mindmap.txt') {
    try {
      const outline = this.convertToTextOutline(mindMapData.root, 0)
      const blob = new Blob([outline], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('导出文本大纲失败:', error)
      throw new Error('导出文本大纲失败')
    }
  },
  
  // 导出为Markdown格式
  exportToMarkdown(mindMapData, filename = 'mindmap.md') {
    try {
      const markdown = this.convertToMarkdown(mindMapData.root, 0)
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('导出Markdown失败:', error)
      throw new Error('导出Markdown文件失败')
    }
  },
  
  // 转换为FreeMind XML格式
  convertToFreeMindXML(node, level = 0) {
    const indent = '  '.repeat(level)
    let xml = `${indent}<node TEXT="${this.escapeXML(node.data.text)}"`
    
    if (node.data.style) {
      if (node.data.style.color) {
        xml += ` COLOR="${node.data.style.color}"`
      }
      if (node.data.style.fontSize) {
        xml += ` FONT_SIZE="${node.data.style.fontSize}"`
      }
    }
    
    xml += '>\n'
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        xml += this.convertToFreeMindXML(child, level + 1)
      })
    }
    
    xml += `${indent}</node>\n`
    return xml
  },
  
  // 转换为文本大纲
  convertToTextOutline(node, level = 0) {
    const indent = '  '.repeat(level)
    let outline = `${indent}${node.data.text}\n`
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        outline += this.convertToTextOutline(child, level + 1)
      })
    }
    
    return outline
  },
  
  // 转换为Markdown格式
  convertToMarkdown(node, level = 0) {
    const prefix = '#'.repeat(Math.min(level + 1, 6)) + ' '
    let markdown = `${prefix}${node.data.text}\n`
    
    if (node.data.note) {
      markdown += `> ${node.data.note}\n`
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        markdown += this.convertToMarkdown(child, level + 1)
      })
    }
    
    return markdown + '\n'
  },
  
  // XML转义
  escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

export default exportService