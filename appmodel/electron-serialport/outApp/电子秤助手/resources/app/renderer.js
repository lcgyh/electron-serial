// // This file is required by the index.html file and will
// // be executed in the renderer process for that window.
// // All of the Node.js APIs are available in this process.

// const serialport = require('serialport')
// const createTable = require('data-table')

// serialport.list((err, ports) => {
//   console.log('ports', ports);
//   // if (err) {
//   //   document.getElementById('error').textContent = err.message
//   //   return
//   // } else {
//   //   document.getElementById('error').textContent = ''
//   // }

//   // if (ports.length === 0) {
//   //   document.getElementById('error').textContent = 'No ports discovered'
//   // }

//   // const headers = Object.keys(ports[0])
//   // const table = createTable(headers)
//   // tableHTML = ''
//   // table.on('data', data => tableHTML += data)
//   // table.on('end', () => document.getElementById('ports').innerHTML = tableHTML)
//   // ports.forEach(port => table.write(port))
//   // table.end();
// })



const ipcRenderer= require('electron').ipcRenderer
const Serialport = require('serialport');


    $(function(){
        var chooselist='null'  //选择的设备
        var bitrate=1200
        var newstringReceived
        var port
        var stringReceived = '';
        //获取设备
        $('#J_devices').on('click',function(){
            console.log('获取/刷新设备')
            $('.devicesbox select option').remove()
            Serialport.list((err, ports) => {
                if(ports && ports.length>0){
                    chooselist=ports[0].comName;
                    for (var i = 0; i < ports.length; i++) {
                      $('.devicesbox select').append("<option value ="+ports[i].comName+">"+ports[i].comName+"</option>")
                    }  
                }else{
                    alert('没有设备端口可以连接')
                }
                
            })

        })
        //设备选择
        $('#J_se1').change(function(){
            chooselist=$("#J_se1").val();
        })

        //波特率选择
        $('#J_se2').change(function(){
            var bitrate=Number($("#J_se2").val());
        })

        //设备连接
        $('#J_connect').on('click',function(){
            const objs={
              baudRate:bitrate,
              autoOpen:false
            }
            console.log(chooselist)
            console.log(objs)
            port = new Serialport(chooselist,objs);
            console.log(port)
          port.open(function(err){
                if(err){
                    alert('链接失败，请重新链接')
                    return console.log('Error opening port: ',err.message);
                }
                $('#J_connectstate').html("链接状态：设备链接成功")
        });
            //监听失败
            port.on('error',function(error){
                //对接收的数据进行数据，传递给使用方
                console.log(error)
            });
            //链接过程中接收到的数据
            port.on('data',function(data){
                console.log(data)
                dataEdit(data)
            });
            
        })

        //断开设备
        $('#J_disconnect').on('click',function(){
          if(port){
            port.close()
              newstringReceived=null
                port=null
                postdatatoweb()
              $('#J_connectstate').html("链接状态：设备链接已断开")
          }

        })


    function convertArrayBufferToString(buf){
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

  //数据处理方法
  dataEdit=(data)=>{
    var str = convertArrayBufferToString(data);
    if (str.charAt(str.length-1) === '\n') {
        stringReceived += str.substring(0, str.length-1);
        //判断新接收到的stringReceived是否和上次相等，如果相等，则不再监听，如果不相等则继续执行
         newstringReceived=stringReceived.substring(2,stringReceived.length-4)
         console.log(newstringReceived)
         if(newstringReceived){
          newstringReceived=String(parseFloat(newstringReceived).toFixed(2))
          postdatatoweb(newstringReceived)
         }
            stringReceived = '';
        } else {
            stringReceived += str;
        }
  }


   

    //数据发送给浏览器端
    function postdatatoweb(data){
        // if(data){
        //     // $('#J_weight').html("当前重量："+data+'kg')

        //     ipcRenderer.send('asynchronous-message',data)
        // }else{
        //     // $('#J_weight').html(null)
        //     ipcRenderer.send('asynchronous-message',null)
        // }
        
        ipcRenderer.send('asynchronous-message',data)

    }

   




  })




  