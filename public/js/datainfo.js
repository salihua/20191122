

/**
 * DataInfo() 对象用于整个的DataInfo页面数据的控制
 */
function DataInfo() {
    this.OriginData = [];
    this.DOMElem = {
        defaultStyle: document.getElementsByClassName("default-style")[0],
        tableElem: document.getElementsByClassName('table-info')[0],
        selectScreen: document.getElementsByClassName('select screen')[0],
        screenInput: document.getElementsByClassName('screen-input')[0],
        sortBtn: document.getElementsByClassName('btn btn-order')[0],
        btnDeleteAll: document.getElementsByClassName('btn btn-delete all')[0],
        btnReturnPage: document.getElementsByClassName('btn btn-return-pagr home')[0],
        loadingData: document.getElementsByClassName('onloading-data')[0],
        dataArea: document.getElementsByClassName('data-area')[0],
        page: document.getElementsByClassName('pager')[0],
        btnBtnOrder: document.getElementsByClassName('btn btn-order')[0],
        showBroken: document.getElementById('broken'),
        mapElem: document.getElementById('map'),
        brokenElem: document.getElementById('broken'),
        btnZhext: document.getElementsByClassName('btn btn-zhext')[0],
        btnMapElem: document.getElementsByClassName('btn btn-map')[0],
        tableShowElem: document.getElementsByClassName('table-show')[0],
        getTableTbodyElem: function () {
            return this.tableElem.getElementsByClassName('tbody');
        },
        loading: function (val1, val2, val3, msg) {
            this.tableShowElem.style.display = val2;
            this.page.style.display = val3;
            this.loadingData.style.display = val1;
            this.loadingData.lastElementChild.innerHTML = msg;
        }

    }
    this.dealWithData = [
    ]
    this.options = {
        panelNumber: 10,
        limit: 10,
    }
    this.positioninfo = [];
    this.fh = '<';

    this.sendGetData();
    this.screen();
    this.search();
    this.gradeDown();
    this.bindEven();
}
/**
 * 绑定事件
 */
DataInfo.prototype.bindEven = function () {
    let that = this;
    this.DOMElem.btnZhext.addEventListener('click', (e) => {
        if (this.DOMElem.defaultStyle.classList.contains('hidden')) {
            if (this.DOMElem.btnZhext.classList.contains('zt')) {
                this.DOMElem.tableShowElem.style.display = 'none';
                this.DOMElem.mapElem.style.display = 'none';
                this.DOMElem.brokenElem.classList.replace('hidden', 'show');
                this.DOMElem.btnZhext.children[1].innerHTML = '图表'
                this.DOMElem.btnZhext.children[0].classList.replace('zhext', 'biaoge');
                this.DOMElem.btnZhext.classList.replace('zt', 'td');
            } else if (this.DOMElem.btnZhext.classList.contains('td')) {
                this.DOMElem.tableShowElem.style.display = 'block';
                this.DOMElem.mapElem.style.display = 'none';
                this.DOMElem.brokenElem.classList.replace('show', 'hidden');
                this.DOMElem.btnZhext.children[1].innerHTML = '折线图';
                this.DOMElem.btnZhext.children[0].classList.replace('biaoge', 'zhext');
                this.DOMElem.btnZhext.classList.replace('td', 'zt');
            }

        }

    });
    this.DOMElem.btnMapElem.addEventListener('click', (e) => {
        if (this.DOMElem.defaultStyle.classList.contains('hidden')) {
            this.DOMElem.tableShowElem.style.display = 'none';
            this.DOMElem.mapElem.style.display = 'block';
            this.DOMElem.brokenElem.className = 'broken-show hidden';
        }

    });
    this.DOMElem.btnDeleteAll.addEventListener('click', (e) => {
        ajax({
            url: `/home/device/deleteAllData/${that.deviceid}`,
            callbackSuccess: (resText, resXML) => {
                if (!resText) {
                    return;
                }
                let res = JSON.parse(resText);
                if (res.status === 1) {
                    window.location.href = `/home/device/toPage/${that.deviceid}`;
                } else {
                    alert(res.data);
                }
            }
        })
    })
    this.DOMElem.btnReturnPage.addEventListener('click', (e) => {
        window.location.href = `/home/device/${this.deviceid}`
    })
}
/**
 * 合并数据
 */
DataInfo.prototype.mergeData = function () {
    this.selectstr = ` <option value="all">==根据传感器名称筛选==</option>`;
    let that = this;
    if (!this.OriginData) {
        return;
    }
    this.dealWithData = [];
    forEach(this.OriginData, function (resultOrigin) {
        if (!resultOrigin.sensorModel || resultOrigin.sensorModel.length <= 0) {
            //that.modifydefaultShow("该设备没有生成数据模型请前往设备详情页生成数据模型", 'block', 'none');
            return;
        }
        that.sort(resultOrigin.data);
        forEach(resultOrigin.sensorModel, function (result) {
            that.selectstr += `<option value="${result.sensorident}">${result.sensorname}</option>`
        })

        forEach(resultOrigin.data, function (data) {

            let pos = {};
            let isTagData = [];
            let sensorname = [];
            let sensorident = [];
            pos['devicename'] = resultOrigin['devicename'];
            pos['deviceid'] = resultOrigin['deviceid']
            deepClone(pos, data);
            forEach(resultOrigin.sensorModel, function (result) {

                isTagData.push(result.isTagData);
                sensorname.push(result['sensorname']);
                sensorident.push(result['sensorident']);
                for (let val in data) {
                    if (val === result['sensorident']) {
                        var prop = {};
                        prop['devicename'] = resultOrigin['devicename'];
                        prop['deviceid'] = resultOrigin['deviceid'];
                        deepClone(prop, result);
                        prop[result['sensorident']] = data[result['sensorident']];
                        prop['date'] = data['date'];
                        that.dealWithData.push(prop);
                    }
                }
            });
            pos['isTagData'] = isTagData;
            pos['sensorname'] = sensorname;
            pos['sensorident'] = sensorident;
            that.positioninfo.push(pos);

        });
    });
    this.DOMElem.selectScreen.innerHTML = this.selectstr;
    this.render(this.dealWithData);
    this.brokenRender();
    this.mapInfo();
    console.log(this.mapInfo);
}
/**
 *通过网络请求获取数据
 */
DataInfo.prototype.sendGetData = function () {
    let arr = window.location.toString().split('/');
    let that = this;
    this.deviceid = trim(arr[arr.length - 1]);
    this.DOMElem.loading('block', 'none', 'none', '正在请求网络数据,请稍后...');
    ajax({
        url: `/home/device/datainfo/${that.deviceid}`,
        callbackSuccess: function (resText, resXML) {
            that.DOMElem.loading('block', 'none', 'none', '正在格式化数据,请稍后...');
            if (!resText) {
                return;
            }
            let data = JSON.parse(resText);

            that.OriginData.push(data.data);

            that.mergeData();
        }
    });
}
/**
 * 用于渲染数据
 */
DataInfo.prototype.render = function (originArr) {
    let that = this;

    if (!originArr || originArr.length <= 0) {
        that.modifydefaultShow("设备数据为空,请上线设备并且上传数据", 'hidden', 'none', 'show', 'none');
        this.DOMElem.loading('none', 'none', 'none', '正在请求网络数据,请稍后...');
    } else {
        that.modifydefaultShow('', 'show', 'block', 'hidden', 'none', 'broken-show hidden');
        this.DOMElem.loading('none', 'block', 'block', '正在请求网络数据,请稍后...');
        let pager = new Pager({
            total: originArr.length,
            panelNumber: this.options.panelNumber,
            limit: this.options.limit,
            onPageChange: function (page) {
                that.renderTbody(page,originArr);
            }
        })
    }

}

/**
 * 用于设置dfaultstyle是否显示
 */
DataInfo.prototype.modifydefaultShow = function (msg, dis1, dis2, dis3, dis4, dis5) {
    this.DOMElem.defaultStyle.classList.replace(dis1, dis3);
    this.DOMElem.tableShowElem.style.display = dis2;
    this.DOMElem.mapElem.style.display = dis4;
    this.DOMElem.brokenElem.className = dis5;
    this.DOMElem.defaultStyle.lastElementChild.innerHTML = msg;
}
/**
 * 用于渲染Tbody页面
 */
DataInfo.prototype.renderTbody = function (page, arr) {
    let panel = this.options.panelNumber
    var end = page * panel; //40 40-38<10 && 2>0
    if (end - arr.length < panel && end - arr.length > 0) {

        end = (arr.length - ((page * panel) - (panel))) + (page * panel) - (panel);

    }
    this.DOMElem.getTableTbodyElem()[0].innerHTML = '';
    for (let x = page * panel - panel; x < end; x++) {
        let tr = document.createElement('tr');
        tr.innerHTML = `
                 <td>${x + 1}</td>
                 <td>${arr[x].devicename}</td>
                 <td>${arr[x].deviceid}</td>
                 <td>${arr[x].sensorname}</td>
                 <td>${arr[x].sensorid}</td>
                 <td>${arr[x].sensorident}</td>
                 <td>${arr[x].sensordatatype}</td>
                 <td>${arr[x][arr[x].sensorident]}</td>
                 <td>${arr[x].date}</td>
                 `;
        this.tagData(tr, arr[x]);
        this.DOMElem.getTableTbodyElem()[0].appendChild(tr);
    }
}
/**
 * 用于标记数据 读取模型中标记数据的条件进行标记
 */
DataInfo.prototype.tagData = function (elem, data) {

    if (!data.isTagData) {

        return;
    }
    if (!data.isTagData.state) {

        return;
    }
    if (!data.isTagData.odds) {

        return;
    }

    if (eval(data.isTagData.odds.replace(/a/g, data[data.sensorident]))) {
        elem.classList.add('question');
    }

}
/**
 * select 下拉选择框筛选数据
 */
DataInfo.prototype.screen = function () {
    this.DOMElem.selectScreen.addEventListener('change', (e) => {
        let selectVal = e.target.value;
        if (selectVal == 'all') {
            this.render(this.dealWithData);
            return;
        }
        let result = filter(this.dealWithData, (res) => {
            return res['sensorident'] == selectVal ? res : undefined;
        });
        if (result && result.length > 0) {
            this.render(result);
        }
    })
}
/**
 * search input文本输入框搜索事件
 */
DataInfo.prototype.search = function () {
    let screenInput = this.DOMElem.screenInput;
    screenInput.addEventListener('input', (e) => {
        let data = e.target.value.toString();
        let result = filter(this.dealWithData, (res) => {
            /**
             * 多层判断支持设备名称设备ID 传感器id 传感器名称 优先匹配id
             */
            if (this.isMe(data, res['sensorid']) || this.isMe(data, res['deviceid']) || this.isMe(data, res['sensorident']) || this.isMe(data, res['sensorname']) || this.isMe(data, res['devicename'])) {
                return res;
            }
        });
        this.render(result);
    })
}
/**
 * 判断字符串中是否包含字串如果有返回true
 */
DataInfo.prototype.isMe = function (origin, target) {
    if (target.indexOf(origin.toString()) === 0) {
        return true;
    } else {
        return false;
    }
}
/**
 * 获取时间差用于排序数据
 */
DataInfo.prototype.getTime = function (time) {
    let date = new Date(time);
    return date.getTime();
}
/**
 * 对数据进行排序默认按照时间降序排序
 */
DataInfo.prototype.sort = function (arr) {
    for (var x = 0; x < arr.length - 1; x++) {
        for (var y = 0; y < arr.length - 1; y++) {
            if (this.componse(this.getTime(arr[y]['date']), this.getTime(arr[y + 1]['date']))) {
                var temp = arr[y];
                arr[y] = arr[y + 1];
                arr[y + 1] = temp;
            }
        }
    }
}
/**
 * 比较两个函数
 */
DataInfo.prototype.componse = function (val1, val2, ) {
    let signal = this.fh || '<';
    if (signal == '<') {
        if (val1 < val2) {
            return true;
        } else {
            return false;
        }
    } else {
        if (val1 > val2) {
            return true;
        } else {
            return false;
        }
    }

}
/**
 * 对数据进行降序排序
 */
DataInfo.prototype.gradeDown = function () {
    let btn = this.DOMElem.btnBtnOrder
    btn.addEventListener('click', (e) => {
        if (btn.classList.contains('up')) {
            this.fh = '>';
            btn.innerHTML = `<span class="btn-icon sort"></span>降序排列`;
            btn.classList.replace('up', 'down');
        } else if (btn.classList.contains('down')) {
            this.fh = '<';
            btn.innerHTML = `<span class="btn-icon sort"></span>升序排列`;
            btn.classList.replace('down', 'up');
        }
        this.mergeData();
    })
}
/**
 * 专门用于制作折线图所需的数据
 */
DataInfo.prototype.spliceBrokenData = function () {
    let title = [];
    let date = [];
    let series = [];
    forEach(this.OriginData, (resultOrigin) => {

        forEach(resultOrigin.sensorModel, (model) => {
            title.push(model['sensorname']);
            let prop = {};
            let datas = [];
            forEach(resultOrigin.data, (data) => {
                for (let val in data) {
                    if (model['sensorident'] == val) {
                        prop['name'] = model['sensorname'];
                        prop['type'] = 'line';
                        prop['stack'] = '总量';
                        datas.push(data[val]);
                    }
                }
            })
            prop['data'] = datas;
            series.push(prop);
        });
        forEach(resultOrigin.data, (data) => {
            date.push(data['date']);
        })
    })
    return {
        title: title,
        date: date,
        series: series
    }
}
/**
 * 折线图显示数据
 */
DataInfo.prototype.brokenRender = function () {
    let data = this.spliceBrokenData();
    let myChart = echarts.init(this.DOMElem.showBroken);

    let option = {
        title: {
            text: '数据变化图'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: data.title
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.date
        },
        yAxis: {
            type: 'value'
        },
        series: data.series
    };
    myChart.setOption(option)

}
/**
 * 地图模块
 */
DataInfo.prototype.mapInfo = function () {
    let that = this;
    this.map = new BMap.Map('map');
    this.point = new BMap.Point(116.404, 39.915);
    this.map.centerAndZoom(this.point, 7);  // 初始化地图,设置中心点坐标和地图级别
    this.setProto();
    this.point = [];
    forEach(this.positioninfo, (res) => {
        if (res.position) {
            var address = res.position.split(',');
            var point = new BMap.Point(address[0], address[1]);
            if(address[0]==0.00 && address[1]==0.00){
                 return;
            }
            let windowinfo = '';
            //匹配传感器名 生成信息
            for (let x = 0; x < res.sensorident.length; x++) {
                windowinfo += `${res.sensorname[x]}:${res[res.sensorident[x]]}  `;
            }
            windowinfo += `  时间:${res.date}  `
            this.point.push(point);
            this.getAddress(point, (result) => {
                //获取地址成功后在尝试进行其他操作
                windowinfo += `位置:${result.address}`;
                let options = {
                    colorimg: 'green',
                    point: point,
                    msg: `设备名称:${res.devicename}  位置:${result.address}`,
                    color: '#008c8c',
                    windowtitle: `设备 ${res.deviceid}`,
                    windowinfo: windowinfo
                }

                let flag = this.weightCalcution(res);
                if (flag === 0) {

                } else if (flag === 1) {
                    options.colorimg = 'yelow';
                    options.color = '#f4ea2a';
                } else {
                    options.colorimg = 'red';
                    options.color = '#d9534f';

                }
                that.addMarker(options);
            });

        }

    });
    this.drawBroken();
}
/**
 * 计算权重
 */
DataInfo.prototype.weightCalcution = function (res) {
    /**
     * 计算条件时 满足一个为黄色 2个为红色 一个都不满足为绿色 逐个计算值 1 黄色 2 红色 0 绿色
     */
    let flag = 0;
    let datas = [];
    let tagData = res.isTagData || [];
    for (let val in res) {
        if (val != 'isTagData' && val != 'devicename' && val != 'position' && val != 'date' && val != 'sensorident' && val != 'sensorname') {
            datas.push(res[val]);
        }
    }
    //根据顺序计算权重
    for (let x = 0; x < datas.length; x++) {
        if (tagData[x]) {
            if (tagData[x].state) {
                if (eval(tagData[x].odds.replace(/a/g, datas[x]))) {
                    flag++;
                }
            }
        }
    }

    return flag;
}
/**
 * 设置地图属性
 */
DataInfo.prototype.setProto = function () {
    //添加地图类型控件
    this.map.addControl(new BMap.MapTypeControl({
        mapTypes: [
            BMAP_NORMAL_MAP,
            BMAP_HYBRID_MAP
        ]
    }));
    this.map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
    this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    //设置地图控件
    this.map.addControl(new BMap.NavigationControl());
    this.map.addControl(new BMap.OverviewMapControl());
    this.map.addControl(new BMap.ScaleControl());
    this.map.addControl(new BMap.MapTypeControl());
}
/**
 * 添加标注和信息窗口
 */
DataInfo.prototype.addMarker = function (option) {
    var myIcon = new BMap.Icon(`../../../image/map-${option.colorimg}.png`, new BMap.Size(200, 200), {
        anchor: new BMap.Size(10, 25),
    });
    var marker = new BMap.Marker(option.point, { icon: myIcon });
    this.map.addOverlay(marker);
    var opts = {
        position: option.point,    // 指定文本标注所在的地理位置
        offset: new BMap.Size(30, -30)    //设置文本偏移量
    }

    var label = new BMap.Label(option.msg, opts);  // 创建文本标注对象
    label.setStyle({
        color: option.color,
        fontSize: "14px",
        height: "20px",
        lineHeight: "20px",
        fontFamily: "微软雅黑"
    });
    this.map.addOverlay(label);

    //信息窗口和ladel
    let that = this;
    var infoOpt = {
        width: 50,     // 信息窗口宽度
        height: 100,     // 信息窗口高度
        title: option.windowtitle, // 信息窗口标题
    }
    var infoWindow = new BMap.InfoWindow(option.windowinfo, infoOpt);  // 创建信息窗口对象 
    marker.addEventListener('click', function (e) {
        that.map.openInfoWindow(infoWindow, option.point); //开启信息窗口
    })
}
/**
 * 绘制直线
 */
DataInfo.prototype.drawBroken = function () {
    let points = this.point;
    var pois = [
        new BMap.Point(116.350658, 39.938285),
        new BMap.Point(116.386446, 39.939281),
        new BMap.Point(116.389034, 39.913828),
        new BMap.Point(116.442501, 39.914603)
    ];
    var polyline = new BMap.Polyline(points, {
        enableEditing: false,//是否启用线编辑，默认为false
        enableClicking: true,//是否响应点击事件，默认为true
        strokeWeight: '8',//折线的宽度，以像素为单位
        strokeOpacity: 0.8,//折线的透明度，取值范围0 - 1
        strokeColor: "#18a45b" //折线颜色
    });
    this.map.addOverlay(polyline);          //增加折线


}
/**
 * 地址转换 经纬度-实际地理位置
 */
DataInfo.prototype.getAddress = function (point, callback) {
    //地址解析
    let myGeo = new BMap.Geocoder();
    myGeo.getLocation(point, (result) => {
        if (result) {
            callback(result);
        }
    });
}
let datainfo = new DataInfo();

