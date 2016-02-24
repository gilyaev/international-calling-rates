var App = {};


BikeJS.JsonP.isValidResponse = function (response) {
    return (response['status'] !== void 0
    && (response['status']['success'] === true || response['status']['success'] === 1));
};

App.CountryModel = BikeJS.Model.extend({
    attributes: {
        'alive': false,
        'alpha2': '',
        'code': null,
        'id': null,
        'name': '',
        'shortName': ''
    },
});

App.RateModel = BikeJS.Model.extend({
    attributes: {
        'areaCode': null,
        'phonePart': null,
        'rate': null,
        'type': null
    },
});

App.CountryRatesModel = BikeJS.Model.extend({
    attributes: {
        'id': null,
        'country': null,
        'rates': []
    },

    url: function () {
        return 'http://www.ringcentral.com/api/index.php?cmd=getInternationalRates&param[internationalRatesRequest][brandId]=1210&param[internationalRatesRequest][countryId]=' + this.get('id') + '&param[internationalRatesRequest][tierId]=3311&typeResponse=json';
    },

    init: function (attrs) {
        var rates, len, ratesRegular, ratesMobile;

        this.attributes['rates'] = []
        if (attrs.Country !== void 0) {
            this.attributes['id'] = attrs.Country.id
            this.attributes['country'] = new App.CountryModel(attrs.Country)
        }

        if ((rates = attrs.Rates) !== void 0) {
            if (BikeJS.Utils.isArray(rates)) {
                len = rates.length;
                for (var i = 0; i < len; i++) {
                    this.attributes['rates'].push(new App.RateModel(rates[i][0]))
                }
            } else if (typeof rates === 'object') {
                if (BikeJS.Utils.isArray(rates.Regular)) {
                    ratesRegular = rates.Regular;
                    len = ratesRegular.length;
                    for (var i = 0; i < len; i++) {
                        this.attributes['rates'].push(new App.RateModel(ratesRegular[i]))
                    }
                }

                if (BikeJS.Utils.isArray(rates.Mobile)) {
                    ratesMobile = rates.Mobile;
                    len = ratesMobile.length;
                    for (var i = 0; i < len; i++) {
                        this.attributes['rates'].push(new App.RateModel(ratesMobile[i]))
                    }
                }
            }
        }
    },

    parse: function (data) {
        var attrs = {
                rates: []
            },
            rates = [],
            len,
            rate = {};

        if ((rates = data['rates']) !== void 0 && rates.length > 0) {
            attrs['id'] = (rates[0] !== void 0) ? rates[0]['key']['id'] : null;
            attrs['country'] = new App.CountryModel((rates[0] !== void 0 ? rates[0]['key'] : {}));
            rates = rates[0] !== void 0 ? rates[0]['value'] : [];
            rates = !BikeJS.Utils.isArray(rates[0]) ? [rates[0]] : rates[0];

            len = rates.length;
            for (var i = 0; i < len; i++) {
                rate = new App.RateModel(rates[i]);
                attrs['rates'].push(rate);
            }
        }
        return attrs;
    }
});

App.Countries = new (BikeJS.Collection.extend({
    url: function () {
        return 'http://www.ringcentral.com/api/index.php?cmd=getCountries&typeResponse=json';
    },

    parse: function (data) {
        if (data['result'] !== void 0) {
            return data['result'];
        }
    }
}))({model: App.CountryModel});

App.AlphaRates = new (BikeJS.Collection.extend({
    model: App.CountryRatesModel,
    url: function (params) {
        params = params || {};
        if (params.letter === void 0) {
            params.letter = 'A';
        }
        return 'http://www.ringcentral.com/api/index.php?cmd=getInternationalRatesByLetter&param[getInternationalRatesByLetter][letter]=' + params.letter + '&typeResponse=json';
    },

    parse: function (data) {
        if (data['RetesByLetter'] !== void 0) {
            return data['RetesByLetter'];
        }
        return [];
    }
}))();

App.RatesView = new (BikeJS.View.extend({
    id: 'rates',

    events: {
        'click .alphabet': function (event) {
            var target = event.target;
            event.preventDefault();
            if (target.href === void 0) {
                return false;
            }

            this.showByLetter(target.text);
            return false;
        },
        'click .search': "search",
        'change select': function (event) {
            var select = event.target,
                text = select[select.selectedIndex].text;

            this.getControll().select().text(text);
            this.getControll().button().unblock();
        }
    },

    init: function () {
        var countriesOptions = '',
            self = this,
            select = self.$el.find('select');

        this.getControll().block();

        App.Countries.fetch({
            success: function () {
                self.getControll().unblock('All');
                App.Countries.each(function () {
                    var opt = document.createElement('option');
                    opt.value = this.get('id');
                    opt.innerHTML = this.get('name');
                    select.appendChild(opt);
                })
            },
            error: function () {
                self.$el.find('#select-holder').html('Not Available');
            }
        });
    },

    getControll: function () {
        var self = this;
        if (this.$select === void 0) this.$select = this.$el.find('select');
        if (this.$button === void 0) this.$button = this.$el.find('div.search');
        if (this.$loader === void 0) this.$loader = this.$el.find('#loader');
        if (this.$table === void 0) this.$table = this.$el.find('table');
        if (this.$selectHolder === void 0) this.$selectHolder = this.$el.find('#select-holder');
        if (this.$alphabet === void 0) this.$alphabet = this.$el.find('.alphabet');
        if (this.$message === void 0) this.$message = this.$el.find('.info-block .message');

        return {
            button: function () {
                return {
                    block: function () {
                        self.$button.addClass('disabled');
                        return this;
                    },
                    unblock: function () {
                        self.$button.removeClass('disabled');
                        return this;
                    }
                }
            },

            select: function () {
                return {
                    block: function () {
                        self.$select.attr('disabled', 'disabled');
                        return this;
                    },
                    unblock: function () {
                        self.$select.removeAttr('disabled', 'disabled');
                        return this;
                    },
                    text: function (text) {
                        self.$selectHolder.html(text);
                        return this;
                    }
                }
            },

            loader: function () {
                return {
                    show: function () {
                        self.$loader.removeClass('hide');
                        return this;
                    },
                    hide: function () {
                        self.$loader.addClass('hide');
                        return this;
                    }
                }
            },

            table: function () {
                return {
                    show: function () {
                        self.$table.removeClass('hide');
                        return this;
                    },
                    hide: function () {
                        self.$table.addClass('hide');
                        return this;
                    }
                }
            },

            message: function () {
                return {
                    'show': function (text) {
                        self.$message.removeClass('hide');
                        return this;
                    },
                    'hide': function (text) {
                        self.$message.addClass('hide');
                        return this;
                    },
                    'text': function (text) {
                        self.$message.html(text);
                        return this;
                    },
                    'type': function (type) {
                        self.$message.addClass('msg-' + type);
                        return this;
                    }
                }
            },

            showAlphabet: function (letters, letter) {
                var len = letters.length,
                    html = '';
                for (var i = 0; i < len; i++) {
                    if (letters[i] === letter) {
                        html += '<span>' + letter + '</span>';
                        continue;
                    }
                    html += '<a href="#">' + letters[i] + '</a>'
                }
                self.$alphabet.removeClass('hide').html(html);
            },

            hideAlphabet: function () {
                self.$alphabet.addClass('hide')
            },

            showLoader: function () {
                this.hideAlphabet();
                this.loader().show();
                this.table().hide();
            },

            hideLoader: function () {
                this.loader().hide();
                this.table().show();
            },

            block: function () {
                this.button().block();
                this.select().block();
            },

            unblock: function (text) {
                if (text !== void 0) self.$selectHolder.html(text);
                this.button().unblock();
                this.select().unblock();
            }
        }
    },

    displayRates: function (filter) {
        var self = this,
            table = self.$el.find('table')._e[0],
            newTablebody = document.createElement('tbody'),
            tableBody = table.getElementsByTagName('tbody')[0],
            rates;

        function onError() {
            self.getControll().loader().hide();
            self.getControll().unblock();
            self.getControll().message()
                .text('Service temporary unavailable. Please try again.')
                .type('error')
                .show();
        }

        function onSuccess() {
            table.replaceChild(newTablebody, tableBody);
            self.getControll().hideLoader();
            self.getControll().unblock();
        }


        this.getControll().block();
        this.getControll().showLoader();

        if (!isNaN(parseFloat(filter)) && isFinite(filter)) {
            rates = new App.CountryRatesModel({id: filter});
            rates.fetch({
                success: function () {
                    self.drawCountryRates(newTablebody, this);
                    onSuccess();
                },
                error: function () {
                    onError();
                }
            });
            return;
        }

        App.AlphaRates.fetch({
            params: {'letter': filter},
            success: function (response) {
                var rates = App.AlphaRates.models,
                    len = rates.length,
                    letters = response.Letters.split(""),
                    letter = response.Letter;

                self.getControll().showAlphabet(letters, letter);

                self.getControll().hideLoader();
                self.getControll().unblock();

                self.getControll().showAlphabet(letters, letter);
                for (var i = 0; i < len; i++) {
                    self.drawCountryRates(newTablebody, rates[i]);
                }
                onSuccess();
            },
            error: function () {
                onError();
            }
        });
        return;
    },

    showByLetter: function (letter) {
        this.displayRates(letter);
        return;
    },

    drawCountryRates: function (tbody, rateObj) {
        var rates = rateObj.get('rates'),
            country = rateObj.get('country'),
            len = rates.length,
            rate, row, tds = [], type;

        for (var i = 0; i < len; i++) {
            rate = rates[i]
            if (type !== rate.get('type')) {
                row = tbody.insertRow();
                if (tds[2] !== void 0) {
                    tds[2].innerHTML = tds[2].innerHTML.slice(0, tds[2].innerHTML.lastIndexOf(","));
                }

                tds[0] = row.insertCell(0);
                tds[0].innerHTML = (type == null ? country.get('name') : '');
                tds[1] = row.insertCell(1);
                tds[1].innerHTML = rate.get('type');
                tds[2] = row.insertCell(2);
                tds[3] = row.insertCell(3);
                tds[3].innerHTML = '$' + rate.get('rate');
                type = rate.get('type');
            }
            tds[2].innerHTML += rate.get('areaCode') + '' + rate.get('phonePart', '') + ', ';
        }

        if (tds[2] !== void 0) {
            tds[2].innerHTML = tds[2].innerHTML.slice(0, tds[2].innerHTML.lastIndexOf(","));
        }
    },

    search: function (event) {
        var select = this.$el.find('select')._e[0],
            id,
            selectedOption = select.options[select.selectedIndex],
            $button = $$(event.target);

        event.preventDefault();

        if ($button.hasClass('disabled')) {
            return false;
        }

        id = selectedOption.value;
        if (id === 'all') {
            return this.displayRates('A');
        }
        return this.displayRates(id);
    }
}));