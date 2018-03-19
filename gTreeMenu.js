/**
 * Created by Gsan.
 * 树形菜单
 *
 */
(function ($) {
    'use strict';
    var gTreeMenu = function (el, option) {
        this.$el = $(el);
        this.option = option;

        this.init();
    };
    gTreeMenu.defalut = {
        // 下一个元素
        nextEl: function (e) {
            return e.next().next().next()
        },
        // 元素 父级数据id
        parentId: function (e) {
            return e.attr('class').split(' ')[2]
        },
        // 元素 数据id
        childId: function (e) {
            return e.attr('class').split(' ')[1]
        },
        // checkbox唯一标识
        checkboxEl: function (e) {
            return $('#' + e);
        },
        checkboxChildCount: function (e) {
            return $('.' + e).length - 1;//  把选择全部元素减去
        },
        checkboxChildCheckCount: function (e) {
            return $('.' + e + ":checked").length
        },
        checkEl: function (e) {
            return e;
        },
        allCheckbox: function (e) {
            return e;
        }
    };
    $.fn.gTreeMenu = function (option) {
        this.data = new gTreeMenu(this, option);
        return this.data;
    };

    gTreeMenu.prototype.init = function () {
        this.option = $.extend(true, {}, gTreeMenu.defalut, this.option);
        var that = this;
        this.option.allCheckbox(this.$el).change(function (e) {
            /* 判断下一个菜单是否为子项 */
            var pre = that.option.checkEl($(this));
            var next = that.option.nextEl(pre);
            // 所有父级菜单
            that.parentIds = [that.option.childId(pre)];
            that.childIds = [];
            while (next.length) {
                pre = next;

                if (that.parentIds.indexOf(that.option.parentId(pre)) < 0) {
                    break;
                }
                that.childIds.push(that.option.childId(pre));
                that.option.checkEl(pre).prop('checked', that.option.checkEl($(this)).prop('checked'));


                next = that.option.nextEl(next);
                // 下一个元素不存在
                if (!next.length) {
                    break;
                }
                if (that.option.parentId(next) === that.option.childId(pre)) {
                    that.parentIds.push(that.option.childId(pre));
                }
            }

            var pid = that.option.parentId($(this));
            while (pid) {
                var parent = that.option.checkboxEl(pid);
                if (!parent.length) {
                    break;
                }
                var all = that.option.checkboxChildCount(pid);
                var check = that.option.checkboxChildCheckCount(pid);
                // 已选中项是否等于选择全部
                that.option.checkEl(parent).prop('checked', true);
                if (check === 0) {
                    that.option.checkEl(parent).prop('checked', false);
                }
                // 上一级的父级
                pid = that.option.parentId(parent);
            }
            e.stopPropagation();
        });
    }

})(jQuery);