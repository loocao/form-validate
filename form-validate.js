/*!
 * form-validate v1.0.0
 * https://github.com/oncereply/form-validate
 *
 * Copyright 2014 oncereply
 * Released under the Apache License Version 2.0
 */
(function ($, undefined) {
    "use strict";
    /**
     * 表单元素类
     * @param element
     * @param config
     * @constructor
     */
    function Element(element, config) {
        this.source = $(element);
        this.config = config;
    }

    Element.attrs = ['classtarget', 'correctclass', 'errorclass', 'msgtarget', 'msg', 'pattern'];
    Element.prototype.attr = function () {
        if (Element.attrs.indexOf(arguments[0]) >= 0) {
            return this.source.attr.call(this.source, this.config.prefix + '-' + arguments[0]);
        }
        return this.source.attr.apply(this.source, arguments);
    };
    Element.prototype.val = function () {
        return this.source.val.apply(this.source, arguments);
    };
    Element.prototype.each = function () {
        return this.source.each.apply(this.source, arguments);
    };

    /**
     * 表单验证类
     * @param form
     * @param config
     * @constructor
     */
    function FormValidate(form, config) {
        config = $.extend({}, $.fn.formValidate.defaults, config);
        //表单元素
        var elements = this.elements = [];
        form.find('input,select,textarea').filter('[' + config.prefix + '-pattern]').each(function () {
            elements.push(new Element(this, config));
        });
        var correct = true; //表单验证结果

        function showErrorMessage(element) {
            var $classtarget = $(element.attr('classtarget'));
            $classtarget.removeClass(element.attr('correctclass')).addClass(element.attr('errorclass'));
            if (element.attr('msgtarget')) {
                var $msgtarget = $(element.attr('msgtarget'));
                $msgtarget.html(element.attr('msg'));
            }
        }

        function showSuccessStyle(element) {
            var $classtarget = $(element.attr('classtarget'));
            $classtarget.removeClass(element.attr('errorclass')).addClass(element.attr('correctclass'));
            if (element.attr('msgtarget')) {
                var $msgtarget = $(element.attr('msgtarget'));
                $msgtarget.html('');
            }
        }

        /**
         * 验证元素
         * @param element
         * @returns {boolean}
         * @private
         */
        function _validate(element) {
            var f = true;
            var pattern = element.attr('pattern');
            var _val = element.val();
            if (pattern) {
                var r = new RegExp(pattern, "i");
                if (!r.test(_val))f = false;
            }
            return f;
        }

        /**
         * 验证
         */
        function check(element) {
            var _correct = _validate(element);
            correct = _correct && correct;
            if (!_correct) {
                showErrorMessage(element);
            } else {
                showSuccessStyle(element);
            }
            return _correct;
        }

        function checkAll() {
            $(elements).each(function () {
                check(this);
            });
        }

        if (config.blurValidate) {
            $(elements).each(function (i, element) {
                element['source'].blur(function () {
                    check(element);
                });
            });
        }
        function resetCorrect() {
            correct = true;
        }

        form.submit(function () {
            checkAll();
            var result = correct;
            //每次点击submit,重置correct,以免影响下次验证
            resetCorrect();
            if (result) {
                return config.success.call(form);
            } else {
                config.error.call(form);
                return false;
            }
        });
    }

    $.fn.formValidate = function (config) {
        new FormValidate($(this), config);
        return $(this);
    };

    $.fn.formValidate.defaults = {
        /**
         * 配置前缀
         */
        prefix: 'form',
        /**
         * 失去焦点时是否验证,默认:false
         */
        blurValidate: false,
        /**
         * 验证通过执行方法
         */
        success: function () {
            return true;
        },
        /**
         * 验证失败执行方法
         */
        error: function () {
            return true;
        }
    };
}(jQuery));
