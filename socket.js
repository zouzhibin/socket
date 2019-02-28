import { mapGetters } from 'vuex'
import Browser from '../../utils/browser'
import { api, proxy } from '../../../config/env/index'

console.log('接口地址;', api)
export default {
  data () {
    return {
      websocket: null,
      reconnect: true,
      timer: null,
      isAutoShow: false
    }
  },
  computed: {
    ...mapGetters([
      'shopId'
    ])
  },
  mounted () {
    this.connectSocket()
  },
  methods: {
    connectSocket () {
      var browser = Browser()
      let protocol = null
      console.log('环境支持:', process.env.NODE_ENV)
      // let apiAddress = api.root;
      let apiAddress = localStorage.getItem('pos_mock_api')
      console.log('头:', apiAddress)
      if (apiAddress) {
        if (apiAddress == 'https://zouzhibing.com') {
          protocol = 'wss://zouzhibing.com'
        } else {
          protocol = `ws://${apiAddress.replace('http://', '')}`
        }
      } else {
        protocol = 'wss://zouzhibing.com'
      }

      if ('WebSocket' in window) {
        this.websocket = new WebSocket(`${protocol}/websocket/${this.shopId}`)
      } else {
        this.$message({
          dangerouslyUseHTMLString: true,
          type: 'error',
          message: `请截图给开发人员进行协助处理<br/>当前浏览器${browser.client.type} | 版本${browser.client.version}`
        })
      }
      // 连接发生错误的回调方法
      // this.websocket.onerror =
      this.websocket.addEventListener('error', this.onerror)
      // 连接成功建立的回调方法
      this.websocket.addEventListener('open', this.onopen)
      // 连接关闭的回调方法
      this.websocket.addEventListener('close', this.onclose)
      // 接收到消息的回调方法
      this.websocket.addEventListener('message', this.onmessage)
    },
    onclose () {
      console.log('WebSocket连接关闭')
      this.websocket.removeEventListener('error', this.onerror)
      this.websocket.removeEventListener('open', this.onopen)
      this.websocket.removeEventListener('close', this.onclose)
      this.websocket.removeEventListener('message', this.onmessage)
      this.websocket = null
      setTimeout(() => {
        this.connectSocket()
      }, 2000)
    },
    onopen () {
      console.log('WebSocket连接成功')
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.websocket.send(1)
      }, 60 * 1000)
    },
    onmessage (event) {
      console.log('收到信息', event, this.isAutoShow)
      this.isAutoShow = false
      this.$nextTick(() => {
        if (event && event.data) {
          console.log('收到信息2', event, this.isAutoShow)
          var data = JSON.parse(event.data)
          if (data.code == 200) {
            var jsSaudio = null
            switch (data.type) {
            case 1: // 订单

              this.audioSrc = require('@/components/u-header/newMamahao.mp3')
              break
            case 2: // 预约
              // jsSaudio.src = require('./newMamahao.mp3')
              this.audioSrc = require('@/components/u-header/newAppointment.mp3')
              break
            default:
              break
            }
            this.isAutoShow = true
          }
        }
      })
    },
    onerror () {
      console.log('WebSocket连接发生错误')
      this.websocket.close()
    }
  }
}
