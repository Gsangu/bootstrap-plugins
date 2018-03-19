/**
 * 自封装table 插件
 * 配合layer 弹窗
 * 配置详情看注释
 */
(function($) {
  'use strict';
  var inJsonKey = function(value, json) {
    for (var i in json) {
      if (i == value) return true;
    }
    return false;
  };
  var gTable = function(el, option) {
    this.$el = $(el);
    this.option = option;

    this.init();
  };
  $.fn.gTable = function(option) {
    this.data = new gTable(this, option);
    return this.data;
  };

  gTable.defalut = {
    column: [],       //  表格显示列
    url: '',          //  获取数据地址
    rowCheck: false, //  显示表格 checkbox
    rowSelect: true,  // 单击选中行
    ajaxData: {       //  ajax 参数
      pageSize: 7,
      page: 1
    },
    action: {     // 按钮
      edit: {
        show: false,
        url: '',
        name: '编辑',
        type: 'icon',
        content: "fa-edit",
        onshow: 1
      },
      del: {
        show: false,
        url: '',
        name: '删除',
        type: 'icon',
        content: "fa-times",
        onshow: 0,
      },
    },
    deleteSelect: false,    //  显示删除选中按钮
    deleteSelectUrl : '',     //  删除选中的地址
    pagination: true,         //    显示分页
    onTableChange : function(){  // 表格数据发生改变执行
      return false;
    }
  };

  gTable.prototype.init = function() {
    this.option = $.extend(true, {}, gTable.defalut, this.option);
    this.setData(this.option.ajaxData);
  };
  var alerts = {
    url: function(event) {
      var data = event.currentTarget.dataset,
        url = this.option.action[data.act].url;

      if (data.url != undefined) {
        url += data.url;
      }
      var $this = this;
      if (data.onshow == 0) {
        var text = event.currentTarget.innerText || data.name;
        alerts.confirm("是否" + text + "?",function() {
          $.ajax({
            type: "POST",
            url: url,
            data: "id=" + data.id,
            dataType: "JSON",
            error: function(request) {
              alerts.error("连接错误,请检查您的网络！");
            },
            success: function(data) {
              if (data.status) {
                alerts.error(data.data);
              } else {
                alerts.success(data.data);
              }
            }
          });
        });
      } else if (data.onshow == 1)
        layer.open({
          type: 2,
          title: data.name,
          shadeClose: true,
          shade: false,
          maxmin: true, //开启最大化最小化按钮
          area: ['40%', '50%'],
          content: this.option.action[data.act].url + "?ID=" + data.id,
          success: function(layero, index) {
            var id = event.currentTarget.dataset.id;
            var table = $this.$el.find('tr[data-id=' + id + ']').find('td');
            //var head = $this.$el.find('[data-head]').find('th');
            //var data = [];
            $.each(table, function(index, value) {
              layero.find('iframe').contents().find('[name=' + $(this).data('name') + ']').val($(this).text());
              //console.log(layero.find('iframe')[0].contentWindow.setData(123));
              //data[index] = { [$(this).data('name')] : $(this).text(),'column': head.eq(index).text()};
            });
            //console.log(data);
          }
        });
      else if (data.onshow == 2)
        location.href = $this.option.action[data.act].url + "?ID=" + data.id;
      else if (data.onshow == 3) {
        $this.option = $this.option.action[data.act].option;
        $this.option.ajaxData = $.extend({}, $this.option.ajaxData, {
          maintenanceId: data.id
        });
        $this.init();
      }

    },
    confirm:function(mes,fun){
      layer.open({
        content: mes,
        icon: 3,
        btn: ['是', '否'],
        yes: fun
      });
    },
    error: function(message) {
      layer.open({
        skin: 'layui-layer-lan',
        content: message,
        icon: 2,
        title: '错误提示',
      });
    },

    //成功弹出层
    success: function(message) {
      layer.open({
        skin: 'layui-layer-lan',
        content: message,
        icon: 1,
        yes: function() {
        },
      });
    },
    load: function() {
      return layer.load(1, {
        shade: [0.1, '#fff'] //0.1透明度的白色背景
      });
    },
    clearAll: function() {
      return layer.closeAll();
    },
  };
  gTable.prototype.setTable = function(data) {
    var $this = this,
      table = "<div class='table-container'><table class='table table-hover text-center gtable'>",
      tr = "<thead><tr data-head>",
      btns = $this.getBtn(),
      col = $this.option.column,
      action = $this.option.action,
      $field = [],
      disable = "";



    if ($this.option.rowCheck) {
      tr += "<th><input type='checkbox' class='gcheckbox' name='selectAll'></th>";
    }
    for (var i = 0; i < col.length; i++) {
      tr += "<th data-field='"+col[i].field+"'>" + col[i].title + "</th>";
      $field.push(col[i].field)
    }


    tr += "</tr></thead><tbody>";
    $.each(data, function(index, value) {
      tr += "<tr data-id='" + value.id + "'>";
      var $td = [], td = '';
      $.each($field, function (i, val) {
        if(value[$field[i]]){
          $td.push(value[$field[i]]);
        }else{
          $td.push('-');
        }

      });
      $.each($td, function (i, val) {
        td += "<td>" + val + "</td>";
      });


      tr += td + "</tr>";
    });
    tr += "</tbody>";
    table += tr;
    table += "</table></div>";
    $this.$el.html(table);
    $this.$el.find('a').off('click').on('click', $.proxy(alerts.url, this));
    if($this.option.rowSelect){

      $this.$el.find('tbody tr').click(function(){
        $(this).toggleClass('selected');
        var check = $(this).find("[type='checkbox']"),
          checkAll = $(this).parents('table').find("[name='selectAll']"),
          tbody = $(this).parents('tbody');
        check.prop('checked',!check.prop('checked'));

        if(checkAll.prop('checked')){
          checkAll.prop('checked',false);
        }else if(tbody.find('.gcheckbox:checked').length == tbody.find('tr').length){
          checkAll.prop('checked',true);
        }
      });
    }
    if ($this.option.rowCheck) {
      $this.$el.find("[name='selectAll']").off('click').on("click",$.proxy(gselectAll, this));
    }
    $this.option.onTableChange();
    return table;
  };
  var gselectAll = function(event){
    var $this = this,
      checkbox = this.$el.find('tbody tr').find('.gcheckbox');

    $.each(checkbox, function(index,value){
      $(this).prop("checked", event.currentTarget.checked);
      if($this.option.rowSelect){
        if(event.currentTarget.checked)
          $(this).parents('tr').addClass('selected');
        else
          $(this).parents('tr').removeClass('selected');
      }
    });
  };
  gTable.prototype.getSelectData = function(){
    var check = this.$el.find('tbody tr').find('.gcheckbox:checked');
    var select = [];
    $.each(check, function(index,value){
      var tr = $(this).parents('tr').find('[data-name]');
      var result = "{";
      $.each(tr,function(idx,val){
        if(!$(this).is('a'))
          result += '"'+$(this).data('name')+'":"'+$(this).text()+'",';
      });
      result = result.substr(0,result.length-1);
      result += "}";
      select.push(JSON.parse(result));
    });
    return select;
  };
  gTable.prototype.getBtn = function() {
    var btns = "",
      action = this.option.action;
    for (var btn in action) {
      if (action[btn].show) {
        if (this.option.column.indexOf('操作') < 0) {
          this.option.column.push('操作');
        }
        action[btn] = $.extend({}, gTable.defalut.action[btn], action[btn]);
        btns += "<a href='javascript:;' data-id='%id' data-onshow=" + action[btn].onshow + " data-act='" + btn + "' data-name='" + action[btn].name + "'";
        if ('tempUrl' in action) {
          btns += ' data-url=' + action.tempUrl;
          delete action.tempUrl;
        }
        if (action[btn].type == "icon") {
          btns += "><i class='" + action[btn].content + "'></i></a>";
        } else if (action[btn].type == 'btn') {
          btns += " class='" + action[btn].class + "";
          if (action[btn].enable != null) {
            btns += " %enable";
          }

          btns += "'>" + action[btn].content + "</a>";
        }
      }
    }

    return btns;
  };
  gTable.prototype.setData = function(data) {
    var load = alerts.load();
    var $this = this;
    //data =
    data = $.extend({}, this.option.ajaxData, data);
    this.option.ajaxData = data;
    $.ajax({
      url: this.option.url,
      type: 'POST',
      async: false,
      data: data,
      dataType: 'JSON',
      success: function(data) {
        if (!data.status) {
          this.requestData = data.data;
          var table = $this.setTable(data.data.list);
          alerts.clearAll();
          $this.getPages();
        }
      },
      error:function(res,s){
        layer.close(load);
        //layer.msg("服务器异常！");
      }
    });
  };
  gTable.prototype.getPages = function() {

    var $this = this,
      pages = '<div class="page text-center">',
      del = '';
    if(this.option.deleteSelect){
      pages += "<a id='gdel' class='btn btn-danger' style='float:left;left:20px;top:10px;position:relative'>批量删除</a>";
    }
    if (!this.option.pagination) {
      return '';
    }
    pages += '<ul class="pagination pagination-lg">';
    pages += '<li';
    if (this.option.ajaxData.page == 1)
      pages += ' class="disabled"';
    pages += '><a href="javascript: ;" class="pre-page"><i class="fa-angle-left"></i></a></li>';
    for (var i = 1; i <= $this.option.requestData.pages; i++) {
      pages += '<li ';
      if (i == $this.option.ajaxData.page) {
        pages += 'class="active"';
      }
      pages += '><a href="javascript:;" class="num-page">' + i + '</a></li>';
    }
    pages += '<li';

    if (this.option.ajaxData.page == $this.option.requestData.pages)
      pages += ' class="disabled"';

    pages += '><a href="javascript: ;" class="next-page"><i class="fa-angle-right"></i></a></li>';
    pages += '</ul></div>';
    $this.$el.append(pages);
    var $page = $this.$el.find('.page');
    $page.find('.pre-page').off('click').on('click', $.proxy($this.pagepre, this));
    $page.find('.next-page').off('click').on('click', $.proxy($this.pagenext, this));
    $page.find('.num-page').off('click').on('click', $.proxy($this.pagenum, this));
    $this.$el.find('#gdel').off('click').on('click', $.proxy($this.delselect, this));
  };
  gTable.prototype.delselect = function(event){
    var select = this.getSelectData(),
      $this = this,
      ids = '';
    for(var i = 0;i < select.length;i++)
      ids += select[i].ID + ",";
    ids = ids.substr(0,ids.length-1);
    alerts.confirm("是否删除序号为（"+ids+"）的记录？",function(){
      $.ajax({
        type: "POST",
        url: $this.option.deleteSelectUrl,
        data: "id=" + ids,
        dataType: "JSON",
        error: function(request) {
          alerts.error("连接错误,请检查您的网络！");
        },
        success: function(data) {
          if (data.status) {
            alerts.error(data.data);
          } else {
            alerts.success(data.data);
          }
        }
      });
    });
  };
  gTable.prototype.pagepre = function(event) {
    if ((this.option.ajaxData.page - 1) === 0) {
      return;
    } else {
      this.option.ajaxData.page--;
    }
    this.setData(this.option.ajaxData);
  };
  gTable.prototype.pagenum = function(event) {
    this.option.ajaxData.page = $(event.currentTarget).text();
    $(event.currentTarget).addClass('active');
    this.setData(this.option.ajaxData);
  };
  gTable.prototype.pagenext = function(event) {
    if ((this.option.ajaxData.page) == this.option.requestData.pages) {
      return;
    } else {
      this.option.ajaxData.page++;
    }
    this.setData(this.option.ajaxData);
  };
  String.prototype.replaceAll = function(a, b) {
    return this.replace(new RegExp(a, "g"), b);
  };

})(jQuery);
