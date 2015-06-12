! function() {
    "use strict";
    "undefined" != typeof L && (L.Floorplanner = L.ImageOverlay.extend({
        options: {
            advanced: !0,
            opacity: .7,
            maintainAspectRatio: !0,
            scaleLimit: .01
        },
        initialize: function(n, e) {
            this._url = n, L.setOptions(this, e), this.editor = !1, this.editorType = !1
        },
        onAdd: function(n) {
            this._map = n, this._bounds = n.getBounds(), this._image || (this._initImage(), this.options.opacity < 1 && this._updateOpacity()), n.getPanes().overlayPane.appendChild(this._image), n.on("viewreset", this._reset.bind(this)), n.options.zoomAnimation && L.Browser.any3d && n.on("zoomanim", this._animateZoom, this), this._reset()
        },
        _initImage: function() {
            var n = this._image = L.DomUtil.create("img", "leaflet-image-layer " + (this._zoomAnimated ? "leaflet-zoom-animated" : ""));
            n.onselectstart = L.Util.falseFn, n.onmousemove = L.Util.falseFn, n.onload = L.bind(function() {
                var n = $(this._image);
                this._imageSize = [n.width(), n.height()], this.initializeMarkers(), this.editor ? this.editor.setSize(this._imageSize) : this._init(), this.fire("load")
            }, this), n.src = this._url
        },
        initializeMarkers: function() {
            var n = this._imageSize || [0, 0];
            if (n = L.point(n[0], n[1]), !this._markers || 3 !== this._markers.length) {
                if (0 === n.x || 0 === n.y) return this._markers = [], console.log("not initalizing markers", this._markers, this._imageSize), void 0;
                var e = this._map,
                    t = e.getViewportBounds();
                t.min.x += 100, t.min.y += 100, t.max.x -= 100, t.max.y -= 100;
                var a = t.getSize(),
                    o = t.getCenter(),
                    i = n.clone(),
                    r = a.x / n.x,
                    s = a.y / n.y;
                console.log(r, s), r > s && (r = s), r > 1 && (r = 1), i.y *= r, i.x *= r, t.min.x = o.x - i.x / 2, t.min.y = o.y - i.y / 2, t.max.x = o.x + i.x / 2, t.max.y = o.y + i.y / 2;
                var l = t.min,
                    c = L.point(t.max.x, t.min.y),
                    d = L.point(t.min.x, t.max.y),
                    u = [l, c, d],
                    p = [L.point(0, 0), L.point(n.x, 0), L.point(0, n.y)];
                this._markers = [], p.forEach(function(n, t) {
                    var a = e.containerPointToLatLng(u[t]);
                    this._markers.push({
                        lat: a.lat,
                        lng: a.lng,
                        x: n.x,
                        y: n.y
                    })
                }, this)
            }
        },
        setAdvanced: function() {
            var n = "advanced";
            return this.editorType !== n && (this._deinit(), this.editorType = n, this._init(), this._reset()), this
        },
        _init: function() {
            var n = this.editorType + "FloorPlanner";
            return this.editorType && this._map && this._image && this._url && this._markers && 0 !== this._markers.length ? (console.log("yep editor", this.editorType, !!this._map, !!this._image, !!this._url, this._markers, this._imageSize), this.editor = L.Floorplanner[n](this._map, $(this._image), this._markers, this._imageSize), this.editor.on("transform", this._onTransform, this), void 0) : (console.log("nope editor", this.editorType, !!this._map, !!this._image, !!this._url, this._markers, this._imageSize), void 0)
        },
        _onTransform: function() {
            this.fire("transform", this)
        },
        _deinit: function() {
            this.editor && (this.editor.off("transform", this._onTransform), this.editor.destroy(), this.editor = null)
        },
        getAdvanced: function() {
            return this._advanced
        },
        setMarkers: function(n) {
            return this._markers = n, this.editor && this.editor.setMarkers(n), this
        },
        getMarkers: function() {
            var n = [];
            return this.editor && (n = this.editor.getMarkers()), this._markers = angular.copy(n), n
        },
        setUrl: function(n) {
            return this._url = n, this._image && (this._deinit(), this._markers = null, this._image.src = n, this.initializeMarkers(), this._init()), this
        },
        onRemove: function() {
            this._deinit();
            var n = $(this._image);
            n.remove()
        },
        _reset: function() {
            var n = this._image,
                e = this._map.latLngToLayerPoint(this._bounds.getNorthWest());
            L.DomUtil.setPosition(n, e)
        }
    }))
}(),
function() {
    "use strict";

    function n(n, e, t, a) {
        if (this._map = n, this._markers = t, this._lastMarkers = [], this._image = e, this.setSize(a), !t || 3 !== t.length) throw console.error(t), new Error("markers not set");
        this._pins = L.layerGroup();
        var o = [1, 2, 3].map(function(n) {
            return new L.icon({
                iconUrl: "/img/icon_marker_" + n + "-move.svg",
                iconSize: [37, 47],
                iconAnchor: [18.5, 44]
            })
        });
        this._markers.forEach(function(n, e) {
            var t = L.marker([n.lat, n.lng], {
                draggable: !0,
                icon: o[e]
            });
            this._pins.addLayer(t), t.on("mousedown", function(n) {
                var e = n.originalEvent,
                    t = e.altKey;
                n.target.editXY = t
            }), t.on("drag", this.onMarkerDrag.bind(this, e))
        }, this), this._pins.addTo(n), this._map.on("viewreset", this._updateImage.bind(this)), this._updateImage(), setTimeout(this.fire.bind(this, "transform", this))
    }
    Object.keys(L.Mixin.Events).forEach(function(e) {
        n.prototype[e] = L.Mixin.Events[e]
    }), n.prototype.setSize = function(n) {
        this._imageSize = n
    }, n.prototype.onMarkerDrag = function(n, e) {
        var t = e.target.editXY,
            a = e.target,
            o = a.getLatLng().wrap();
        if (t) {
            var i = this._map.latLngToLayerPoint(o),
                r = this._getTransformMatrix(!0);
            window.layerpoint = [i.x, i.y, 1];
            var s = vec3.transformMat3([], [i.x, i.y, 1], mat3.transpose([], r)),
                l = this._imageSize || [3e3, 3e3];
            0 <= s[0] && s[0] <= l[0] && 0 <= s[1] && s[1] <= l[1] && (this._markers[n].x = s[0], this._markers[n].y = s[1], this._markers[n].lat = o.lat, this._markers[n].lng = o.lng)
        } else this._markers[n].lat = o.lat, this._markers[n].lng = o.lng;
        this._updateImage(), this.fire("transform", this)
    }, n.prototype.setMarkers = function(n) {
        return 0 !== n.length ? (this._markers = n, this.updateMarkerPositions(), this._updateImage(), this) : void 0
    }, n.prototype.getMarkers = function() {
        return this._markers
    }, n.prototype._getTransformMatrix = function(n) {
        n = n || !1;
        var e = this,
            t = this.getMarkers(),
            a = [].concat.apply([], t.map(function(n) {
                return [n.x, n.y, 1]
            }));
        a = mat3.transpose([], a), window.fpPositions || (window.fpPositions = a);
        var o = [].concat.apply([], t.map(function(n) {
            var t = e._map.latLngToLayerPoint([n.lat, n.lng]);
            return [t.x, t.y, 1]
        }));
        o = mat3.transpose([], o), window.mapPositions || (window.mapPositions = o);
        var i, r;
        return n ? i = mat3.mul([], mat3.invert([], o), a) : (r = mat3.invert([], a), i = mat3.mul([], r, o)), window.defaultTransform = i, i
    }, n.prototype._updateImage = function() {
        var n = this._getTransformMatrix(),
            e = [n[0], n[3], n[1], n[4], n[2], n[5]];
        e = e.map(function(n) {
            return n.toFixed(12)
        });
        var t = {
            x: 0,
            y: 0,
            z: 0
        };
        return $(this._image).css({
            "-webkit-transform": "matrix(" + e.join(",") + ")",
            "-webkit-transform-origin": t.x + "px " + t.y + "px " + t.z + "px",
            "-moz-transform": "matrix(" + e.join(",") + ")",
            "-moz-transform-origin": t.x + "px " + t.y + "px " + t.z + "px",
            "-o-transform": "matrix(" + e.join(",") + ")",
            "-o-transform-origin": t.x + "px " + t.y + "px " + t.z + "px",
            "-ms-transform": "matrix(" + e.join(",") + ")",
            "-ms-transform-origin": t.x + "px " + t.y + "px " + t.z + "px",
            transform: "matrix(" + e.join(",") + ")",
            "transform-origin": t.x + "px " + t.y + "px " + t.z + "px",
            top: 0,
            left: 0
        }), this
    }, n.prototype.updateMarkerPositions = function() {
        var n = this,
            e = this._pins.getLayers();
        n.getMarkers().forEach(function(n, t) {
            e[t].setLatLng([n.lat, n.lng])
        })
    }, n.prototype.destroy = function() {
        this._pins.clearLayers(), this._map.off("viewreset", this._updateImage.bind(this))
    }, L.Floorplanner.advancedFloorPlanner = function(e, t, a, o) {
        return new n(e, t, a, o)
    }
}(),
function() {
    "use strict";

    function n(n, e, t) {
        this._map = n, this._markers = t, this._image = e, this.options = {
            maintainAspectRatio: !0,
            scaleLimit: .01
        };
        var a = t.map(function(e) {
                return n.latLngToLayerPoint([e.lat, e.lng])
            }),
            o = L.bounds(a),
            i = o.getCenter(),
            r = Math.abs(a[0].x - a[1].x) / t[1].x;
        r > 1 && (r = 1);
        var s = t[1].x,
            l = t[2].y,
            c = i.x - s / 2,
            d = i.y - l / 2;
        this._image.css({
            "-webkit-transform-origin": "50% 50%",
            "-moz-transform-origin": "50% 50%",
            "-o-transform-origin": "50% 50%",
            "-ms-transform-origin": "50% 50%",
            "transform-origin": "50% 50%"
        }), this._image.freetrans({
            maintainAspectRatio: this.options.maintainAspectRatio,
            scaleLimit: this.options.scaleLimit,
            matrix: [r, 0, 0, r, c, d]
        });
        var u = this;
        this._image.on("transformed", function() {
            u.fire("transform", u)
        })
    }
    Object.keys(L.Mixin.Events).forEach(function(e) {
        n.prototype[e] = L.Mixin.Events[e]
    }), n.prototype.setMarkers = function() {
        return this
    }, n.prototype.getMarkers = function() {
        var n = $(this._image),
            e = this._map,
            t = n.freetrans("getOptions"),
            a = n.freetrans("getBounds"),
            o = n.width(),
            i = n.height(),
            r = [{
                x: 0,
                y: 0
            }, {
                x: o,
                y: 0
            }, {
                x: 0,
                y: i
            }],
            s = [t.scalex, t.scaley],
            l = Math.PI / 180 * t.angle,
            c = vec2.scale([], [o, i], .5),
            d = a.center,
            u = 50,
            p = e.containerPointToLayerPoint([d.x, d.y - u]),
            m = mat2d.identity([]);
        return m = mat2d.translate([], m, [p.x, p.y]), m = mat2d.scale([], m, s), m = mat2d.rotate([], m, l), m = mat2d.translate([], m, c.map(function(n) {
            return -n
        })), r.forEach(function(n, t) {
            var a = vec2.transformMat2d([], [n.x, n.y], m),
                o = e.layerPointToLatLng(a);
            r[t].lat = o.lat, r[t].lng = o.lng
        }), this._markers = angular.copy(r), r
    }, n.prototype.destroy = function() {
        var n = $(this._image);
        n.data("freetrans") && $(this._image).freetrans("destroy")
    }, L.Floorplanner.simpleFloorPlanner = function(e, t, a) {
        return new n(e, t, a)
    }
}(),
function() {
    "use strict";
    angular.module("idamaps", ["ngAnimate", "angularMoment", "ui.router", "ui.bootstrap", "angulartics", "angulartics.google.analytics", "intercom", "idamaps.form", "idamaps.cancelpreventer", "idamaps.api", "idamaps.authenticator", "idamaps.map", "idamaps.dashboard", "idamaps.account", "idamaps.help", "idamaps.application", "idamaps.errorHandler"]).config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function(n, e, t) {
        e.otherwise("/dashboard"), t.html5Mode(!0), n.state("root", {
            url: "",
            views: {
                "header@": {
                    templateUrl: "/components/header/header.html",
                    controller: "HeaderCtrl"
                },
                "": {
                    template: '<ui-view class="mainview" />'
                }
            },
            resolve: {
                account: ["idaAuthenticator", function(n) {
                    return n.getAccount()
                }]
            }
        })
    }]).run(["$rootScope", "idaAuthenticator", "$log", "$state", "$window", function(n, e, t, a, o) {
        n.wwwUrl = o.wwwDomain || "www.indooratlas.com", n.loading = {
            show: !1
        }, n.$on("$stateChangeStart", function() {
            n.loading.show = !0
        }), n.$on("$stateChangeSuccess", function() {
            n.loading.show = !1
        }), n.$on("$stateChangeError", function() {
            n.loading.show = !1
        }), n.$state = a, n.account = e.getAccount(), n.authenticator = e, e.init()
    }])
}(), angular.module("idamaps").run(["$templateCache", function(n) {
        n.put("/components/account/apps.html", "<h2>Apps</h2>\n"), n.put("/components/account/index.html", '<div class="container" style="margin-top: 32px;">\n  <div class="row">\n    <div class="col-md-12 hero-header">\n      <h1>Account</h1>\n    </div>\n  </div>\n  <div ui-view></div>\n  <div class="row">\n  </div>\n</div>\n'), n.put("/components/account/settings.html", '<form role="form" class="row form-horizontal" name="detailsForm">\n  <div class="col-sm-12">\n    <h3> Contact info </h3>\n  </div>\n\n  <div class="col-sm-8">\n    <div class="alert alert-danger" ng-show="detailsError">\n      {{detailsError}}\n    </div>\n\n    <div class="alert alert-success" ng-show="detailsSuccess">\n      {{detailsSuccess}}\n    </div>\n  </div>\n\n  <div class="col-sm-8">\n    <div form-field="detailsForm.username">\n      <label for="inputUsername" class="col-sm-6 control-label">Username</label>\n      <div class="col-sm-6">\n        <input\n          type="text"\n          class="form-control"\n          id="inputUsername"\n          required="true"\n          disabled="disabled"\n          ng-model="accountDetails.username"\n          placeholder="Username" />\n      </div>\n    </div>\n    <div form-field="detailsForm.email">\n      <label for="inputEmail" class="col-sm-6 control-label">Email</label>\n      <div class="col-sm-6">\n        <input\n          type="text"\n          class="form-control"\n          id="inputEmail"\n          required="true"\n          disabled="disabled"\n          ng-model="accountDetails.email"\n          placeholder="Email" />\n      </div>\n    </div>\n\n    <div form-field="detailsForm.firstName">\n      <label for="inputPhone" class="col-sm-6 control-label">First name</label>\n      <div class="col-sm-6">\n        <input\n          type="text"\n          class="form-control"\n          ng-model="accountDetails.firstName"\n          placeholder="First name"\n          id="inputFirstName">\n      </div>\n    </div>\n\n    <div form-field="detailsForm.lastName">\n      <label for="inputPhone" class="col-sm-6 control-label">Last name</label>\n      <div class="col-sm-6">\n        <input\n          type="text"\n          class="form-control"\n          ng-model="accountDetails.lastName"\n          placeholder="Last name"\n          id="inputLastName">\n      </div>\n    </div>\n\n    <div class="col-sm-offset-6 col-sm-6">\n      <div class="checkbox">\n        <label for="emailMarketing">\n          <input\n            type="checkbox"\n            name="allowMarketingEmail"\n            class=""\n            ng-model="accountDetails.allowMarketingEmail"\n            id="emailMarketing">\n            Receive emails from indoorAtlas\n        </label>\n      </div>\n    </div>\n\n    <div class="col-sm-offset-6 col-sm-6">\n      <button\n        ng-disabled="detailsForm.$invalid"\n        ida-submit="submit()"\n        >\n        Submit\n      </button>\n    </div>\n  </div>\n</form>\n\n<form role="form" name="passwordForm" class="row form-horizontal">\n  <div class="col-sm-12">\n    <h3> New Password </h3>\n  </div>\n\n  <div class="col-sm-8">\n    <div class="alert alert-danger" ng-show="passwordError">\n      {{passwordError}}\n    </div>\n\n    <div class="alert alert-success" ng-show="passwordSuccess">\n      {{passwordSuccess}}\n    </div>\n  </div>\n\n\n  <div class="col-sm-8">\n    <div form-field="passwordForm.oldPassword">\n      <label for="inputPassword" class="control-label col-sm-6">Old password</label>\n      <div class="col-sm-6">\n        <input\n          type="password"\n          name="oldPassword"\n          ng-model="passwords.oldPassword"\n          class="form-control"\n          required="true"\n          placeholder="Old password"\n          id="inputOldPassword">\n      </div>\n    </div>\n\n    <div form-field="passwordForm.newPassword">\n      <label for="inputPassword" class="control-label col-sm-6">New password</label>\n      <div class="col-sm-6">\n        <input type="password"\n          class="form-control"\n          name="newPassword"\n          ng-model="passwords.newPassword"\n          required="true"\n          placeholder="New password"\n          id="inputPassword">\n      </div>\n    </div>\n\n    <div form-field="passwordForm.newPasswordVerification">\n      <label for="inputPassword2" class="col-sm-6 control-label">Type your new password again</label>\n      <div class="col-sm-6">\n        <input type="password"\n          class="form-control"\n          name="newPasswordVerification"\n          ng-model="passwords.newPasswordVerification"\n          match="passwords.newPassword"\n          required="true"\n          placeholder="Verify password"\n          id="inputPassword2">\n      </div>\n    </div>\n\n    <div class="col-sm-offset-6 col-sm-6">\n      <button\n        ng-disabled="passwordForm.$invalid"\n        ng-class="btn-success"\n        ida-submit="submitPassword(passwordForm)">\n        Submit\n      </button>\n    </div>\n  </div>\n</form>\n'), n.put("/components/application/application-apikey.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <div class="btn-group pull-right dropdown"\n      ng-if="canEdit()"\n      ng-class="{open: contextMenuOpen}"\n      ng-mouseenter="contextMenuOpen = true"\n      ng-mouseleave="contextMenuOpen = false"\n      >\n      <span class="icon icon-faded icon_cog"></span>\n      <ul class="dropdown-menu" role="menu">\n        <li class="danger"><a href="#" ng-click="deleteApikey(apikey)">Delete</a></li>\n      </ul>\n    </div>\n    &nbsp;\n  </div>\n  <div class="list-group" style="padding-right: 30px;">\n    <div class="list-group-item">\n      <h4 class="list-group-item-heading">Id</h4>\n      <p class="list-group-item-text" style="word-wrap: break-word;">\n        {{apikey.id}}\n      </p>\n    </div>\n    <div class="list-group-item">\n      <h4 class="list-group-item-heading">Secret</h4>\n      <p class="list-group-item-text" style="word-wrap: break-word;">\n        {{apikey.secret}}\n      </p>\n    </div>\n    <div class="list-group-item">\n      <div class="row">\n        <div class="col-xs-5">\n          <button class="btn btn-default btn-block" ui-sref="^" style="width:99%;">Close</button>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/application/application.html", '<div class="row" style="width: 100%;">\n  <div class="col-md-6">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <div class="btn-group pull-right dropdown"\n          ng-if="canEdit()"\n          ng-class="{open: contextMenuOpen}"\n          ng-mouseenter="contextMenuOpen = true"\n          ng-mouseleave="contextMenuOpen = false"\n          >\n          <span class="icon icon-faded icon_cog"></span>\n          <ul class="dropdown-menu" role="menu">\n            <li class="danger"><a ng-click="deleteApp(app)">Delete</a></li>\n          </ul>\n        </div>\n        {{app.name}}\n      </div>\n      <div class="list-group">\n        <div class="list-group-item group-item-description">\n          <div class="list-group-item-text">\n            {{app.description}}\n          </div>\n        </div>\n\n        <a\n          class="list-group-item appear"\n          style="white-space: nowrap; overflow:hidden; text-overflow: ellipsis;"\n          ng-repeat="apikey in apikeys"\n          ui-sref-active="active"\n          ui-sref="root.app.app.apikey({ apikeyId: apikey.id })">\n            ApiKey {{ apikey.id }}\n        </a>\n\n        <div class="list-group-item">\n          <div class="row">\n            <div class="col-sm-5">\n              <button\n                class="btn btn-default btn-block"\n                style="width:99%;"\n                ui-sref="root.app">\n                Close\n              </button>\n            </div>\n\n            <div class="col-sm-7">\n              <button\n                class="btn btn-success btn-block"\n                ng-if="canEdit()"\n                ida-submit="newApiKey(app)">\n                Add apikey\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="col-md-6 fadeIn-container">\n    <div ui-view class="fadeIn"></div>\n  </div>\n</div>\n'), n.put("/components/application/applications.html", '<div class="container" style="margin-top: 32px">\n  <div class="row">\n    <div class="col-md-12 hero-header">\n      <h1>My apps</h1>\n    </div>\n  </div>\n  <div class="row">\n    <div class="col-md-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">\n          My apps\n        </div>\n        <div class="list-group">\n          <a class="list-group-item"\n            ui-sref-active="active"\n            ng-repeat="app in apps"\n            ui-sref=".app({ appId: app.id })">\n\n            <span ng-if="app.isNew" class="badge alert-success">new</span>\n            <span ng-if="app.alerts" class="badge alert-danger"> {{app.alerts}} </span>\n\n            <h4 class="list-group-item-heading">{{app.name}}</h4>\n\n            <p class="list-group-item-text">{{app.description}}</p>\n          </a>\n\n          <div class="list-group-item" ng-if="!apps.length">\n            <p class="list-group-item-text"> <em>Press CREATE NEW to have your first app.</em> </p>\n          </div>\n\n          <div class="list-group-item">\n            <a class="btn btn-success" ui-sref-active="active" ui-sref=".new()">Create new</a>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-8 fadeIn-container">\n      <div ui-view class="fadeIn"></div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/application/new.html", '<div class="row">\n  <div class="col-sm-6">\n    <div class="list-group">\n      <div class="list-group-item group-item-heading">\n        <div class="mainheader">\n          <span>New app</span>\n        </div>\n      </div>\n      <form name="newapp">\n        <div class="alert alert-danger" ng-show="error">\n          {{error}}\n        </div>\n        <div class="list-group-item">\n        <div class="form-group">\n          <input type="text" required class="form-control" name="name"\n          ng-model="app.name" placeholder="Name" />\n        </div>\n        <div class="form-group">\n          <textarea required class="form-control" name="description"\n            rows="3" ng-model="app.description" placeholder="Description">\n          </textarea>\n        </div>\n        <div class="form-group row">\n          <div class="col-sm-6">\n            <a class="btn btn-lg btn-block btn-default" ui-sref="^">Cancel</a>\n          </div>\n          <div class="col-sm-6">\n            <button\n              class="btn btn-lg btn-block btn-success"\n              ng-disabled="newapp.$invalid"\n              ida-submit="submit()">\n              Submit\n            </button>\n          </div>\n        </div>\n      </div>\n      </form>\n    </div>\n  </div>\n</div>\n'), n.put("/components/authenticator/forgot-password.html", '<div class="container login-container">\n  <div class="row">\n    <div class="col-md-offset-4 col-md-4">\n        <h2> Forgot password </h2>\n      </div>\n      <div class="col-md-offset-4 col-md-4">\n        <form name="forgotForm" role="form">\n          <div>\n            <div form-error="error"></div>\n            <div class="alert alert-success" ng-show="success">\n              {{success}}\n            </div>\n            <div form-field="forgotForm.email">\n              <div class="input-group input-group-lg">\n                <span class="input-group-addon">@</span>\n                <input type="email" required class="form-control" name="email"\n                  ng-model="account.email" placeholder="Email" />\n              </div>\n            </div>\n          </div>\n          <div>\n            <div class="btn-group">\n              <a class="btn btn-ui-alternative" ui-sref="root.login">Login</a>\n              <a class="btn btn-ui-alternative" ui-sref="root.signup">Sign up</a>\n            </div>\n            <div class="pull-right">\n              <button\n                class=""\n                ng-disabled="forgotForm.$invalid"\n                ida-submit="submit()">\n                new password\n              </button>\n            </div>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/authenticator/login.html", '<div class="container login-container">\n  <div class="row">\n    <div class="col-md-offset-4 col-md-4">\n      <h1> Sign in </h1>\n    </div>\n  </div>\n  <div class="row">\n    <div class="col-md-offset-4 col-md-4">\n      <form name="loginForm" role="form" login-form>\n        <div>\n          <div class="alert alert-danger" ng-show="error">\n            {{error}}\n          </div>\n          <div form-field="loginForm.username">\n            <div class="input-group input-group-lg">\n              <span class="input-group-addon"><span class="icon icon_person"></span></span>\n              <input\n                id="username"\n                type="text"\n                required\n                class="form-control"\n                name="username"\n                ng-model="login.username"\n                autocapitalize="off"\n                placeholder="Username" />\n            </div>\n          </div>\n          <div form-field="loginForm.password">\n            <div class="input-group input-group-lg">\n              <span class="input-group-addon"><span class="icon icon_lock"></span></span>\n              <input\n                id="password"\n                type="password"\n                required\n                class="form-control"\n                name="password"\n                ng-model="login.password"\n                placeholder="Password" />\n            </div>\n          </div>\n        </div>\n        <div>\n          <div class="btn-group">\n            <a class="btn btn-ui-alternative" ui-sref="root.signup" style="font-size: 12px;">Sign up</a>\n            <a class="btn btn-ui-alternative" ui-sref="root.forgot-password" style="font-size: 12px;">Forgot password</a>\n          </div>\n          <div class="pull-right">\n            <button\n              class=""\n              type="submit"\n              ng-disabled="loginForm.$invalid"\n              ida-submit="submit()">\n              Sign in\n            </button>\n          </div>\n        </div>\n      </form>\n    </div>\n  </div>\n</div>\n'), n.put("/components/authenticator/signup.html", '<div class="container login-container">\n  <div class="row">\n    <div class="col-md-offset-4 col-md-4">\n      <h1> Sign up</h1>\n    </div>\n  </div>\n  <div class="col-md-offset-4 col-md-4">\n    <form name="signupForm">\n      <div>\n        <div form-error="error"></div>\n        <div form-field="signupForm.username" class="form-signup-field">\n          <div class="input-group input-group-lg">\n            <span class="input-group-addon"><span class="icon icon_person"></span></span>\n            <input\n            type="text"\n            required\n            class="form-control"\n            name="username"\n            ng-model="signup.username"\n            autocapitalize="off"\n            placeholder="Username" />\n          </div>\n        </div>\n        <div form-field="signupForm.email" class="form-signup-field">\n          <div class="input-group input-group-lg">\n            <span class="input-group-addon"><span class="icon icon_text">@</span></span>\n            <input type="email" required class="form-control" name="email"\n            ng-model="signup.email" placeholder="Email" />\n          </div>\n        </div>\n        <div form-field="signupForm.password" class="form-signup-field">\n          <div class="input-group input-group-lg">\n            <span class="input-group-addon"><span class="icon icon_lock"></span></span>\n            <input type="password" required class="form-control" name="password"\n            ng-model="signup.password" placeholder="Password" />\n          </div>\n        </div>\n        <p class="small lead">\n          I agree to the <a target="_blank" href="//{{wwwUrl}}/terms">Terms of Service</a> and the <a target="_blank" href="//{{wwwUrl}}/terms/privacy">Privacy Policy</a>\n        </p>\n      </div>\n      <div>\n        <div class="btn-group">\n          <button\n            class="btn btn-ui-alternative"\n            type="button"\n            ui-sref="root.login">Sign in</button>\n        </div>\n        <div class="pull-right">\n          <button\n            type="submit"\n            class="btn-lg"\n            ng-disabled="signupForm.$invalid"\n            ida-submit="submit()">\n            Create account\n          </button>\n        </div>\n      </div>\n    </form>\n  </div>\n</div>\n'), n.put("/components/cancelpreventer/cancelpreventer-modal.html", '<div>\n  <div class="modal-header">\n    <h4> Are you sure you want to leave </h4>\n  </div>\n  <div class="modal-body">\n    All unsaved changes will be lost\n  </div>\n  <div class="modal-footer">\n    <button class="btn btn-default" ng-click="$dismiss()"> Cancel </button>\n    <button class="btn btn-primary" ng-click="$close()"> OK </button>\n  </div>\n</div>\n'), n.put("/components/dashboard/dashboardbox-directive.html", '<div class="dashboardbox">\n  <div class="panel panel-default panel-dashboardbox">\n  <div\n    ng-click="toggle(box)"\n    class="panel-heading"\n    >\n    {{box.title}}\n  </div>\n  <div ng-show="loading" class="loading">\n    <i class="icon icon_loading icon_rotate icon_faded"></i>\n  </div>\n  <div\n    ng-if="!loading"\n    ng-include="templateUrl()"\n    >\n  </div>\n</div>\n'), n.put("/components/dashboard/guide.html", '<div class="container">\n  <div class="row">\n    <div class="col-xs-offset-1 col-xs-10">\n      <h1> Fingerprinting guide </h1>\n\n      <h2> On desktop </h2>\n\n      <h3> Add venue </h3>\n      <p>\n        <ul>\n          <li>Click "Map" in top right menu after you sign in.</li>\n          <li>Enter the city in the search box, select the right one from the drop down list.</li>\n          <li>Find venueâ€™s location by dragging the map or tapping zoom buttons.</li>\n          <li>Click "ADD VENUE" and move the blue marker over the building.</li>\n          <li>Enter the name of the venue (Required).</li>\n          <li>Select whether the venue is public or private - public venues can be used by other IndoorAtlas clients.</li>\n          <li>Click "SUBMIT."</li>\n        </ul>\n      </p>\n\n      <h3> Add floor plan </h3>\n\n      <p>\n        <ul>\n          <li>Click "ADD FLOORPLAN" after you create the venue.</li>\n          <li>Enter the name of the floor plan and the floor number (Required).</li>\n          <li>Choose the floor plan image file (PNG format recommended).</li>\n          <li>Select "HERE SAT." mode in the bottom right corner for a better view of the venue. (Optional)</li>\n          <li>Position the floor plan in the right location either by manually moving markers 1, 2, 3 or by setting known Geo coordinates in "Advanced mode."</li>\n          <li>Click "SUBMIT."</li>\n        </ul>\n      </p>\n\n      <h2> On mobile </h2>\n\n      <h3> Start using IndoorAtlas MapCreator app </h3>\n\n      <p>\n        We recommend using the Nexus 5 device for fingerprinting.\n      </p>\n      <p>\n        <ul>\n          <li>Use your Android phone to download and install the IndoorAtlas MapCreator app from Google Play (latest version 1.4.1.35 updated on Apr 14, 2015).</li>\n          <li>Log in using same account you used when adding venues and floor plans.</li>\n          <li>Use the search bar on the top right corner to search for street and city name.</li>\n          <li>Find your target venue\'s marker on the satellite map.</li>\n          <li>Tap the marker and select a floor number and floor plan to open it.</li>\n          <li>If this is a new floor plan, â€œNo mapâ€ will pop up on the screen since there is no magnetic field map available at this moment.</li>\n        </ul>\n      </p>\n\n      <h3> Start fingerprinting </h3>\n      <p>\n        We are now in positioning mode. Tap menu on the bottom right corner, select â€œMappingâ€ to go to mapping mode. The app will fetch floor plan first and then update map data from IndoorAtlas\' servers.\n      </p>\n      <p>\n        <ul>\n          <li>Tap menu and select â€œCalibration.â€  Follow the on-screen instructions to complete calibration.\n          <li>Note that you have to tap â€œTap to startâ€ and then rotate the device in order to calibrate it.</li>\n          <li>Calibration is required during fingerprinting on a regular basis to ensure data quality.</li>\n          <li>The calibration screen will pop up automatically when calibration is necessary.</li>\n          <li>Set start point and end point to draw a path on the floor plan.</li>\n          <li>Stand at the start point, tap the record button, and then start walking immediately towards the end point.</li>\n          <li>Stop recording when you reach the end point.</li>\n          <li>During this process, make sure to\n            <ul>\n              <li>Walk at a steady pace and in a straight line following the path you drew</li>\n              <li>Keep the phone directed straight ahead in front of yourself</li>\n          </ul>\n          </li>\n          <li>When walking alongside walls, try to keep your device at least 50cm away from the wall.</li>\n          <li>If during recording, there is a change in speed, direction or path, you can delete and redo the path by tapping the path and selecting delete.</li>\n          <li>Repeat above steps until the area is well covered by the paths. Ensure the path you draw is connected with existing paths. (Tip: double tap the start point icon so the start point will be placed exactly at the end point of last path, thus connecting the two paths)</li>\n        </ul>\n      </p>\n\n\n      <h3> Upload data </h3>\n      <p>\n        <ul>\n          <li>Upload data to IndoorAtlas\' servers.</li>\n          <li>After the map data is uploaded, tap â€œYesâ€ to generate a new map on IndoorAtlas\' servers.</li>\n          <li>Skip the part for test path, as it is for quality analysis purposes only and will not affect your map data.</li>\n          <li>The map will be generated by IndoorAtlas\' servers. This requires an internet connection and may take a few minutes or more depending on the size of the map.</li>\n        </ul>\n      </p>\n\n      <h3> Test the positioning </h3>\n      <p>\n        <ul>\n          <li>Start testing the positioning after the map is successfully generated on IndoorAtlas\' servers.</li>\n          <li>Select positioning mode in the menu or simply tap the Android Back button to go back to positioning mode.</li>\n          <li>Tap the play button on the bottom left corner and start exploring the mapped area and check the moving blue dot.</li>\n          <li>During this process, keep the phone directed straight ahead in front of yourself.  Please note that an internet connection is required.</li>\n        </ul>\n      </p>\n    </div>\n  </div>\n  <div class="row row-spacer"></div>\n</div>\n'), n.put("/components/dashboard/index.html", '<div class="container">\n  <div class="row">\n    <div class="col-xs-12 hero-header">\n      <h1>Dashboard</h1>\n    </div>\n  </div>\n  <div class="row">\n    <div class="col-md-4">\n      <header>\n        <img class="center-block" src="/img/icon-create_venue.svg">\n      </header>\n      <h2>\n        <span class="sphere sphere_1">1</span>\n        Create venue\n      </h2>\n      <p>\n        Use the IndoorAtlas web tool to create venues and add floor plans. Sign up and access the web tool directly from your account. For quick demos you can also create venues and add floor plans using the IndoorAtlas mobile app.\n      </p>\n      <footer>\n      <button\n        open-vimeo="111097506"\n        class="btn btn-lg btn-success center-block">Watch video</button>\n      </footer>\n    </div>\n    <div class="col-md-4">\n      <header>\n        <img class="center-block" src="/img/icon-collect_data.svg">\n      </header>\n      <h2>\n        <span class="sphere sphere_2">2</span>\n        Collect data\n      </h2>\n      <p>\n        Use the IndoorAtlas mobile app to access floor plans and collect magnetic field map data. The data is uploaded to the IndoorAtlas cloud service and is used to create the magnetic field map of the venue.\n      </p>\n      <footer style="text-align: center;">\n        <div class="btn-group btn-group-lg">\n          <a\n            class="btn btn-success"\n            ui-sref="root.guide"\n            >Guide</a>\n          <button\n            open-vimeo="111101319"\n            class="btn btn-success">Watch video</button>\n        </div>\n      </footer>\n    </div>\n    <div class="col-md-4">\n      <header>\n        <img class="center-block" src="/img/icon-create_app.svg">\n      </header>\n      <h2>\n        <span class="sphere sphere_3">3</span>\n        Create app\n      </h2>\n      <p>\n        Use the IndoorAtlas SDK to add location based features to your mobile app. The IndoorAtlas API communicates with the positioning service that computes deviceâ€™s location and returns it back to your mobile app.\n      </p>\n      <footer style="text-align: center;">\n        <a ng-show="!auth.hasIdentity" ui-sref="root.signup" class="btn btn-lg btn-success">Sign up now</a>\n        <a ng-show="auth.hasIdentity" ui-sref="root.help.downloads" class="btn btn-lg btn-success">Download SDK</a>\n      </footer>\n    </div>\n  </div>\n\n  <div class="row row-spacer"></div>\n\n  <div class="row">\n    <div dashboardbox="box" ng-repeat="box in boxes"></div>\n  </div>\n\n  <div class="row row-spacer"></div>\n\n  <div class="row">\n    <div class="col-md-4 text-left">\n      <a target="_blank" href="https://itunes.apple.com/us/app/indooratlas/id720005234"> <img src="/img/app-store.svg" /></a>\n      <a target="_blank" href="https://play.google.com/store/apps/details?id=com.indooratlas.mapcreator.main"> <img src="/img/play-store.png" /></a>\n    </div>\n    <div class="col-md-offset-4 col-md-4 text-right">\n      <p style="line-height: 45px;">\n        Â© 2014 IndoorAtlas Ltd.\n      </p>\n    </div>\n  </div>\n\n  <div class="row row-spacer"></div>\n</div>\n'), n.put("/components/footer/footer.html", '<div class="footer" ng-show="showFooter()">\n  <div class="container">\n    <div class="row">\n      <div class="col-md-12 text-right">\n        <p class="small">\n          Â© 2014 IndoorAtlas Ltd.\n        </p>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/form/formfield-directive.html", '<div\n  class="form-group"\n  ng-class="{\'has-error\': field.$dirty && field.$invalid, \'has-success\': field.$dirty && !field.$invalid}"\n  >\n  <div ng-transclude></div>\n\n  <div\n    ng-messages="field.$error"\n  >\n    <div\n      ng-message="filetypeError"\n      class="alert alert-danger help-block appear"\n    >\n      Filetype is not supported\n    </div>\n    <div\n      ng-message="server"\n      class="alert alert-danger help-block appear"\n    >\n      {{field.$error.server | formatError}}\n    </div>\n  </div>\n</div>\n'), n.put("/components/form/idasubmit-directive.html", '<button type="submit" class="btn btn-primary ida-submit">\n  <span ng-transclude></span>\n  <i ng-show="loading" class="icon icon_loading_small icon_rotate"></i>\n</button>\n'), n.put("/components/header/header.html", '<div ng-class="navbarstyle()" class="navbar navbar-default navbar-fixed-top" role="navigation">\n  <div class="container-fluid" ng-mouseleave="navbarCollapse = true">\n    <div class="navbar-header">\n      <button type="button" class="navbar-toggle" ng-click="navbarCollapse = !navbarCollapse">\n        <span class="sr-only">Toggle navigation</span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n      </button>\n      <a class="navbar-brand" ng-href="//{{wwwUrl}}">IndoorAtlas</a>\n    </div>\n    <div class="navbar-collapse collapse" collapse="navbarCollapse">\n      <ul class="nav navbar-nav navbar-right" ng-click="navbarCollapse = true">\n        <li ui-sref-active="active">\n          <a ui-sref="root.dashboard">Dashboard</a>\n        </li>\n\n        <li ng-class="{active: $state.includes(\'root.map\')}"ng-show="auth.hasIdentity">\n        <a ui-sref="root.map.venues({dontzoom: 0})">Map</a>\n        </li>\n\n\n        <li ng-class="{active: $state.includes(\'root.help.downloads\')}" ng-show="auth.hasIdentity">\n          <a ui-sref="root.help.downloads">Downloads</a>\n        </li>\n\n        <li ng-class="{active: $state.includes(\'root.app\')}" ng-show="auth.hasIdentity">\n        <a ui-sref="root.app">Apps</a>\n        </li>\n\n        <li class="main-navigation-sign-in" ng-show="auth.hasIdentity" ui-sref-active="active">\n          <a ui-sref="root.account.settings">Account</a>\n        </li>\n\n        <li ng-show="auth.hasIdentity" ui-sref-active="active">\n          <a ui-sref="root.logout">Sign out</a>\n        </li>\n\n        <li class="main-navigation-sign-in" ng-show="!auth.hasIdentity" ui-sref-active="active">\n          <a ui-sref="root.login">Sign in</a>\n        </li>\n      </ul>\n    </div>\n  </div>\n</div>\n'), n.put("/components/help/api.html", ""), n.put("/components/help/downloads.html", '<div class="container">\n  <div class="row">\n    <div class="col-md-12 hero-header">\n      <h1>Downloads</h1>\n    </div>\n  </div>\n  <div class="row">\n    <div class="col-md-6">\n      <h3> Apps </h3>\n      <div\n        class="list-group-item"\n        ng-repeat="dl in apps"\n        >\n        <div class="badge badge-nocolor">\n          <a\n            class="btn btn-primary"\n            ng-href="{{downloadUrl(dl)}}"\n            target="_blank"\n            >\n            Download\n          </a>\n        </div>\n        <h4 class="list-group-item-heading">\n          {{dl.name}}\n        </h4>\n        <p class="list-group-item-text">\n        {{dl.description}}\n        </p>\n        <p class="list-group-item-text">\n        </p>\n      </div>\n\n    </div>\n    <div class="col-md-6">\n\n      <h3> SDKs </h3>\n      <div class="list-group download-list">\n        <div\n          class="list-group-item"\n          ng-repeat="dl in sdks"\n          >\n\n\n          <div class="badge badge-nocolor">\n            <a\n              class="btn btn-primary"\n              download="true"\n              ng-href="{{downloadUrl(dl)}}"\n              target="_blank"\n              >\n              Download\n            </a>\n          </div>\n          <h4 class="list-group-item-heading">\n            {{dl.name}}\n          </h4>\n          <p class="list-group-item-text">\n          {{dl.description}}\n          </p>\n          <p class="list-group-item-text">\n          </p>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/help/getting-started-android.html", '<h1>Android API</h1>\n<p>\nUse the IndoorAtlas SDK to build location-aware apps for mapped venues. The Android SDK contains the the IndoorAtlas API jar, documentation, and an example Eclipse project. Supported Android devices must have accelerometer, gyro, and compass sensors, and up to date OS (4.3+). For development work, we recommend Nexus 4/5 and Samsung Galaxy S5 devices with the latest Android. Download the IndoorAtlas Android SDK here.\n</p>\n\n<h2>Tutorial</h2>\n<iframe src="//player.vimeo.com/video/107898476" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>\n<p><a href="http://vimeo.com/107898476">IndoorAtlas</a> from <a href="http://vimeo.com/indooratlas">IndoorAtlas</a> on <a href="https://vimeo.com">Vimeo</a>.</p>\n\n<h2>Example code</h2>\n<div gist="lanttu/af63d5c3d4dcaf334e83"></div>\n<div gist="lanttu/ceeb4127f81bae5b4e51"></div>\n'), n.put("/components/help/getting-started-ios.html", '<h1> iOS API </h1>\n<p>Use the IndoorAtlas SDK to build location-aware apps for mapped venues. The iOS SDK contains the IndoorAtlas API framework, documentation, and an example Xcode project. iPod Touch devices are not supported due to missing compass. Download the IndoorAtlas iOS SDK here.  </p>\n\n<h2> Tutorial video </h2>\n<iframe src="//player.vimeo.com/video/107898476" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>\n<p><a href="http://vimeo.com/107898476">IndoorAtlas</a> from <a href="http://vimeo.com/indooratlas">IndoorAtlas</a> on <a href="https://vimeo.com">Vimeo</a>.</p>\n\n\n<h2> Example code </h2>\n<div gist="Cloudef/8caa40aa41cd89f41044"></div>\n\n'), n.put("/components/help/getting-started.html", '<div class="container" style="margin-top: 32px;">\n  <div class="row">\n    <div class="col-sm-4 col-md-3 col-lg-2">\n      <ul class="nav nav-pills nav-stacked">\n        <li ui-sref-active-eq="active">\n          <a ui-sref="root.help">\n            General\n          </a>\n        </li>\n        <li ui-sref-active="active">\n          <a ui-sref="root.help.ios">\n            iOS API\n          </a>\n        </li>\n        <li ui-sref-active="active">\n          <a ui-sref="root.help.android">\n            Android API\n          </a>\n        </li>\n        <li ui-sref-active="active">\n          <a ui-sref="root.help.downloads">\n            Downloads\n          </a>\n        </li>\n        <li>\n          <a href="#">\n            Knowledge base\n          </a>\n        </li>\n      </ul>\n    </div>\n    <div class="col-sm-8 col-md-9 col-lg-10">\n      <div ui-view class="fadeIn">\n        <h1> General </h1>\n\n        <h2> Signup </h2>\n        <p>Create a free IndoorAtlas account here.</p>\n\n        <h2> Create Buildin and floor plan </h2>\n        <p> Use the IndoorAtlas Map web application to create buildings and submit floor plan images to IndoorAtlas for mapping. You can also use IndoorAtlas Mobile application for iOS for creating buildings and submitting floor plan images.  </p>\n\n        <h2> Collect data and test</h2>\n        <p>Use the IndoorAtlas Mobile app to record sensor data, to create maps by uploading the data to IndoorAtlas, and to test positioning. The IndoorAtlas Mobile is available for iPhone and iPad and most Android devices. Supported Android devices must have accelerometer, gyro, and compass sensors, and up to date OS (4.3+). For best quality mapping, we recommend iPhone 6, Nexus 4/5 and Samsung Galaxy S5 devices.  </p>\n\n        <h2> Build apps with API </h2>\n        <p> Use the IndoorAtlas API to build location-aware apps for mapped venues. The API connects with the IndoorAtlas service and provides your app a precise indoor position in multiple coordinate systems. The API is available for iPhone and iPad and for most Android devices. Supported Android devices must have accelerometer, gyro, and compass sensors, and up to date OS (4.3+).  </p>\n\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/help/index.html", '<!--\n   -<div class="navbar navbar-subnav">\n   -  <div class="container">\n   -    <div class="navbar-header">\n   -      <p class="navbar-text"> API </p>\n   -    </div>\n   -\n   -    <ul class="nav navbar-nav navbar-right">\n   -      <li ui-sref-active="active">\n   -        <a ui-sref="root.help.gettingstarted">\n   -          Getting started\n   -        </a>\n   -      </li>\n   -      <li ui-sref-active="active">\n   -        <a ui-sref="root.help.downloads">\n   -          Downloads\n   -        </a>\n   -      </li>\n   -    </ul>\n   -  </div>\n   -</div>\n   -->\n\n<div class="container" style="margin-top: 32px;">\n  <ui-view class="fadeIn" />\n</div>\n\n'), n.put("/components/map/floorplan-analytics.html", '<div class="mapview-fixed">\n  <div class="container">\n    <div class="row ng-cloak" ng-show="errorCase == 1 || errorCase == 5 || errorCase == 4">\n      <div class="col-md-10 col-md-offset-1">\n        <h2> No analytics found for floor plan at this time</h2>\n        <p class="ng-cloak" ng-hide="errorCase == 4">\n          Map generation might be too old. Please regenerate map using IndoorAtlas Map Creator\n        </p>\n        <p class="ng-cloak" ng-show="errorCase == 4">\n          To enable positioning analytics and help you make a better map, please add test paths to the map first.\n        </p>\n        <p class="ng-cloak" ng-show="errorCase == 4">\n          Please also checkout our <a href="/guide">Fingerprinting Guide</a> how to collect better data.\n        </p>\n        <button\n          class="btn btn-default"\n          ng-disabled="mapGenerating"\n          ui-sref="^.info">\n          Close\n        </button>\n        <div\n          class="alert alert-danger"\n          role="alert"\n          ng-show="mapGenError"\n          >\n          <p>Map generation failed with message: {{mapGenError}}</p>\n        </div>\n      </div>\n    </div>\n    <div class="row ng-cloak" ng-hide="errorCase == 1 || errorCase == 5 || errorCase == 4">\n      <div class="col-md-4">\n        <ul class="list-group list-group-analytics">\n          <li class="list-group-item group-item-heading">\n            <div class="list-group-item-heading">\n              {{floorplan.name}}\n            </div>\n          </li>\n          <li class="list-group-item">\n            <span\n              class="badge badge-help"\n              tooltip-placement="right"\n              tooltip="Total navigable area">\n              ?\n            </span>\n            Mapped area {{analytics.mappedArea | number:1}}mÂ²\n          </li>\n          <li class="list-group-item">\n            <span\n              class="badge badge-help"\n              tooltip-placement="right"\n              tooltip="Percentage of mapped area where positioning accuracy can be validated">\n              ?\n            </span>\n            Validated map area {{analytics.validationStateSpaceCoveragePercent * 100 | number:1}}%\n          </li>\n          <li class="list-group-item">\n            <span\n              class="badge badge-help"\n              tooltip-placement="right"\n              tooltip="Estimate of mapped area per hour">\n              ?\n            </span>\n            Mapping efficiency {{analytics.approximateMappedAreaPerHour | number:1}}mÂ²/h\n          </li>\n          <li class="list-group-item">\n            <span\n              class="badge badge-help"\n              tooltip-placement="right"\n              tooltip="Estimated total time spend mapping based on path recording timestamps">\n              ?\n            </span>\n            Total mapping time {{analytics.approximateTotalMappingSessionsTimeSeconds | secondsToHumanReadable}}\n          </li>\n          <li class="list-group-item">\n            <span\n              class="badge badge-help"\n              tooltip-placement="right"\n              tooltip="Mean positioning error in validated map area">\n              ?\n            </span>\n            Mean positioning error {{analytics.tests[testIndex].avgDistAfterConv | number:1}}m\n          </li>\n          <li class="list-group-item row">\n            <div class="col-xs-5">\n              <button\n                class="btn btn-default btn-block"\n                ui-sref="^.info"\n                >\n                Close\n              </button>\n            </div>\n          </li>\n        </ul>\n      </div>\n      <div class="col-md-8 ng-cloak">\n        <div class="panel panel-plain" ng-show="analytics.tests[0].positioningErrorImageUrl">\n          <div class="panel-heading panel-heading-plain">\n            Map quality\n            <span\n              class="badge badge-help"\n              tooltip="Estimated positioning accuracy">\n              ?\n            </span>\n          </div>\n          <div class="panel-body">\n            <img class="img-responsive" ng-src="{{analytics.tests[0].positioningErrorImageUrl}}" alt="Positioning error" />\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="row" ng-if="showDebug">\n      <div class="col-md-4">\n        <div class="panel panel-plain">\n          <div class="panel-heading">\n            All available values (debug)\n          </div>\n          <div class="panel-body">\n            <ul class="list-unstyled">\n              <li ng-repeat="(key, val) in analytics.plain()" ng-if="key!=\'tests\'">\n              {{key}}: {{val}}\n              </li>\n\n              <li ng-repeat="(key, json) in analytics.tests">\n              {{key}}\n              <ul>\n                <li ng-repeat="(key, val) in json">\n                {{key}}: {{val}}\n                </li>\n              </ul>\n              </li>\n            </ul>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n'), n.put("/components/map/floorplan-remove.html", '<div class="panel panel-map">\n  <div class="panel-heading">\n      Are you sure you want to delete?\n  </div>\n  <div class="panel-body">\n    <div class="row">\n      <div class="col-sm-5">\n        <a class="btn btn-block btn-default" ui-sref="^.info">Cancel</a>\n      </div>\n      <div class="col-sm-7">\n        <button\n          class="btn-success btn-block"\n          ida-submit="submit(venue)"\n          >\n          Submit\n        </button>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/map/floorplan.html", '<div>\n  <div class="list-group">\n    <div class="list-group-item group-item-heading">\n      <div class="list-group-item-heading">\n\n        <!-- Edit context menu -->\n        <div class="btn-group pull-right dropdown animate-down"\n          ng-if="canEdit()"\n          ng-mouseenter="contextMenuOpen = true"\n          ng-mouseleave="contextMenuOpen = false"\n          >\n          <span class="icon icon-faded icon_cog"></span>\n          <ul class="dropdown-menu" ng-show="contextMenuOpen" role="menu">\n            <li><a ui-sref="^.edit">Edit</a></li>\n            <li class="divider"></li>\n            <li><a ui-sref="^.remove">Delete</a></li>\n          </ul>\n        </div>\n        <!-- /Edit context menu -->\n\n        {{venue.name}}\n      </div>\n\n      <div\n        class="mainheader">\n        <span>\n          {{floorplan.name}}\n        </span>\n      </div>\n    </div>\n\n    <div class="list-group-item">\n      <h5 class="list-group-item-heading">\n        FloorplanId\n      </h5>\n      <p class="list-group-item-text">\n        {{floorplan.id}}\n      </p>\n    </div>\n    <div class="list-group-item">\n      <h5 class="list-group-item-heading">\n        FloorId\n      </h5>\n      <p class="list-group-item-text">\n        {{floorplan.floor.id}}\n      </p>\n    </div>\n    <div class="list-group-item">\n      <h5 class="list-group-item-heading">\n        VenueId\n      </h5>\n      <p class="list-group-item-text">\n        {{venue.id}}\n      </p>\n    </div>\n    <div class="list-group-item">\n      <h5 class="list-group-item-heading">\n        Map status\n      </h5>\n      <p class="list-group-item-text ng-cloak" ng-show="mapStatus == null">\n        loading <i class="icon icon_loading icon_rotate"></i>\n      </p>\n      <p class="list-group-item-text ng-cloak" ng-show="mapStatus.isMapAvailable == true">\n        Latest map created at {{mapStatus.latestMapCreatedAt | amDateFormat: \'YYYY-MM-DD hh:mm:ss\'}}\n      </p>\n      <p class="list-group-item-text ng-cloak" ng-show="mapStatus.isMapAvailable == false">\n        No map available\n      </p>\n    </div>\n    <div class="list-group-item">\n      <h5 class="list-group-item-heading">\n        Geocoordinates\n      </h5>\n      <table class="list-group-item-text table table-borderless">\n        <tr ng-repeat="marker in markers">\n          <td> {{marker.lat}} </td>\n          <td> {{marker.lng}} </td>\n        </tr>\n      </table>\n    </div>\n    <div class="list-group-item row">\n      <div class="col-xs-5">\n        <button\n          class="btn btn-default btn-block"\n          ui-sref="root.map.venue.info({venueId: venue.id})"\n          >\n          Close\n        </button>\n      </div>\n      <div class="col-xs-7"\n        ng-show="analyticsAvailable(mapStatus)">\n        <button\n          class="btn btn-default btn-block"\n          ui-sref="^.analytics"\n          >\n          Analytics\n        </button>\n    </div>\n  </ul>\n</div>\n'), n.put("/components/map/index.html", '<div class="mapview">\n\n  <div map></div>\n  <div map-layers></div>\n  <div map-zoom></div>\n\n  <div class="container mapview-container">\n    <div class="fadeIn-container full-width">\n      <div ui-view="mapview" class="fadeIn"></div>\n    </div>\n  </div>\n  <div ui-view="mapviewFixed" class="fadeInFixed"></div>\n\n</div>\n'), n.put("/components/map/maplayers-directive.html", '<div class="maplayers-container">\n  <div\n    class="dropdown dropup animate-up"\n    >\n    <div\n      class="btn btn-ida-dropdown btn-ui"\n      ng-click="menuOpen = !menuOpen"\n      >\n      {{currentLayer}}\n      <span class="caret"></span>\n    </div>\n    <ul\n      class="dropdown-menu showSlideIn"\n      ng-show="menuOpen"\n      role="menu"\n      >\n      <li\n        ng-repeat="(name, layer) in layers"\n        ng-class="{active: currentLayer == name}"\n        >\n        <a\n          href="#"\n          ng-click="select(name)"\n          >\n          {{name}}\n        </a>\n      </li>\n    </ul>\n  </div>\n</div>\n'), n.put("/components/map/mapzoom-directive.html", '<div\n  class="mapzoom-container"\n  >\n  <div class="btn-group-vertical">\n    <button\n      class="btn btn-ui"\n      ng-click="zoomIn()"\n      >\n      <span class="text-icon">\n        +\n      </span>\n    </button>\n    <button\n      class="btn btn-ui"\n      ng-click="zoomOut()"\n      >\n      <span class="text-icon">\n        -\n      </span>\n    </button>\n  </div>\n</div>\n'), n.put("/components/map/newfloorplan.html", '<form name="form">\n  <div class="panel-body">\n    <div class="panel-header">\n      <h3 class="list-group-item-heading">\n        {{venue.name}}\n      </h3>\n    </div>\n    <div form-error="error"></div>\n\n    <div form-field="form.name">\n      <input\n        name="name"\n        type="text"\n        class="form-control"\n        required\n        ng-model="floorplan.name"\n        placeholder="Name of floorplan (required)" />\n    </div>\n    <div form-field="form.level">\n      <input\n        name="level"\n        type="number"\n        autocomplete="off"\n        class="form-control"\n        ng-if="newFloorplan"\n        required\n        ng-model="floorplan.level"\n        min="-999"\n        max="9999"\n        placeholder="Floor number (required)" />\n\n      <span ng-if="!newFloorplan" >\n        {{floorplan.level}}\n      </span>\n\n    </div>\n\n    <div class="divider"></div>\n\n    <div\n      form-field="form.imageContent"\n      ng-if="newFloorplan"\n      >\n      <label>\n        Image file\n      </label>\n      <input\n        type="file"\n        required\n        name="imageContent"\n        style="width: 100%;"\n        filereader\n        ng-model="floorplan.image" />\n\n      <div ng-messages="form.markers.$error">\n        <div ng-message="count" class="alert alert-danger help-block appear">\n          Move markers to right positions</div>\n        <div ng-message="server" class="alert alert-danger help-block appear">\n          {{field.$error.server | formatError}}\n        </div>\n      </div>\n    </div>\n\n\n    <div class="form-group">\n      <label>\n        Image opacity\n      </label>\n      <input\n        type="range"\n        name="opacity"\n        min="0"\n        max="1"\n        step="0.05"\n        ng-model="settings.opacity" />\n    </div>\n\n    <div class="form-group row">\n      <div class="col-sm-5">\n        <a\n          class="btn btn-block btn-default"\n          ng-click="cancel()"\n        >\n          Cancel\n        </a>\n      </div>\n      <div class="col-sm-7">\n        <button\n          class="btn btn-block btn-success"\n          ng-disabled="form.$invalid"\n          ida-submit="submit()"\n        >\n          Submit\n        </button>\n      </div>\n    </div>\n\n    <div\n      floorplan-rotate\n      markers="markers"\n      image="floorplan.image || floorplan.url"\n      opacity="settings.opacity"\n      advanced="settings.advanced"\n      map-instance="map"\n      marker-form="innerform"\n      calculated-dimensions="dimensions"\n    ></div>\n\n    <div class="advanced-settings-toggle">\n      <button class="btn btn-sm btn-ui" ng-click="settings.advanced = !settings.advanced">\n        Advanced mode\n        <span class="caret"></span>\n      </button>\n    </div>\n  </div>\n  <div class="advanced-settings panel-body showSlideIn" ng-show="settings.advanced && markers">\n    <h4> Latitude & Longitude </h4>\n    <div class="row">\n\n      <ng-form name="innerform">\n        <div ng-repeat="index in [0, 1, 2]">\n          <div class="col-sm-6" form-field="innerform.lat[index]">\n            <input\n            name="lat[index]"\n            type="text"\n            class="form-control input-sm"\n            required\n            ng-disabled="markers[index] == null"\n            ng-model="markers[index].lat"\n            ng-model-options="{ updateOn: \'default blur\', debounce: {\'default\': 500, \'blur\': 0} }"\n            ng-pattern="/^-?\\d{1,3}\\.\\d+$/"\n            placeholder="Latitude" />\n          </div>\n          <div class="col-sm-6" form-field="innerform.lng">\n            <input\n            name="lng"\n            type="text"\n            class="form-control input-sm"\n            required\n            ng-disabled="markers[index] == null"\n            ng-model="markers[index].lng"\n            ng-model-options="{ updateOn: \'default blur\', debounce: {\'default\': 500, \'blur\': 0} }"\n            ng-pattern="/^-?\\d{1,3}\\.\\d+$/"\n            placeholder="Longitude" />\n          </div>\n        </div>\n      </ng-form>\n    </div>\n    <h4> Dimensions </h4>\n    <div class="row">\n      <div class="col-sm-12">\n        {{dimensions.height | number:2 }}m, {{dimensions.width | number:2 }}m, {{dimensions.depth | number:2 }}m\n      </div>\n    </div>\n    <div class="row">\n      <div class="col-sm-12">\n        <span class="muted">\n          Alt+drag to move markers within image\n        </span>\n      </div>\n    </div>\n  </div>\n</form>\n'), n.put("/components/map/newvenue.html", '<header ng-if="newVenue" class="mapview-header">\n  <div\n    search\n    value="venue.address"\n    callback="searchSelect(target)"\n    >\n  </div>\n</header>\n\n<div class="panel-body">\n  <div form-error="error"></div>\n\n  <form name="venueForm" role="form">\n    <div form-field="venueForm.location">\n      <input\n        type="hidden"\n        validate-position\n        marker-position\n        required\n        name="location"\n        ng-model="venue.location"\n        />\n    </div>\n\n\n    <div form-field="venueForm.name">\n      <input\n        required\n        type="text"\n        class="form-control"\n        name="name"\n        ng-model="venue.name"\n        placeholder="Name of the venue (required)" />\n    </div>\n\n    <div form-field="venueForm.address">\n      <input\n        type="text"\n        required\n        class="form-control"\n        name="address"\n        placeholder="Address"\n        ng-model="venue.address"\n        placeholder="Address (required)"\n        />\n    </div>\n    <div form-field="venueForm.description">\n      <textarea\n        class="form-control"\n        name="description"\n        rows="3"\n        placeholder="Venue description"\n        ng-model="venue.description"\n        >\n      </textarea>\n    </div>\n    <div class="form-group">\n      <div class="radio-inline">\n        <label>\n          <input type="radio" name="isPrivate" ng-model="venue.isPrivate" value="false" ng-value="false">\n          Public\n        </label>\n      </div>\n      <div class="radio-inline">\n        <label>\n          <input type="radio" name="isPrivate" ng-model="venue.isPrivate" value="true" ng-value="true">\n          Private\n        </label>\n      </div>\n    </div>\n    <div class="form-group row">\n      <div class="col-sm-5">\n        <a class="btn btn-block btn-default" ng-click="cancel()">Cancel</a>\n      </div>\n      <div class="col-sm-7">\n        <button\n          class="btn-success btn-block"\n          ng-disabled="venueForm.$invalid"\n          ida-submit="submit(venue)"\n          >\n          Submit\n        </button>\n      </div>\n    </div>\n  <form>\n</div>\n'), n.put("/components/map/venue-remove.html", '<div class="panel panel-map">\n  <div class="panel-heading">\n      Are you sure you want to delete?\n  </div>\n  <div class="panel-body">\n    <div class="row">\n      <div class="col-sm-5">\n        <a class="btn btn-block btn-default" ng-click="cancel()">Cancel</a>\n      </div>\n      <div class="col-sm-7">\n        <button\n          class="btn-success btn-block"\n          ida-submit="submit(venue)"\n          >\n          Submit\n        </button>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/map/venue.edit.html", '<div>\n  <div venuemarkers="venue" venuemarkers-own="{{isOwn()}}"></div>\n\n  <ul class="list-group">\n    <li class="list-group-item group-item-heading">\n      <div class="form-group">\n        <input\n          class="form-control"\n          type="text"\n          ng-model="venue.name"\n          placeholder="Name" />\n      </div>\n      <div class="form-group">\n        <input\n        class="form-control"\n        type="text"\n        ng-model="venue.address"\n        placeholder="Address" />\n      </div>\n    </li>\n\n    <li class="list-group-item group-item-description">\n      <div class="list-group-item-text">\n        <div class="form-group">\n          <textarea\n            class="form-control"\n            style="resize: none;"\n            rows="3"\n            ng-model="venue.description"\n            placeholder="Description">\n          </textarea>\n        </div>\n      </div>\n    </li>\n\n    <li class="list-group-item row">\n      <div class="col-xs-6">\n        <div class="radio-inline">\n          <label>\n            <input type="radio" name="isPrivate" ng-model="venue.isPrivate" value="false" ng-value="false">\n            Public\n          </label>\n        </div>\n      </div>\n      <div class="col-xs-6">\n        <div class="radio-inline">\n          <label>\n            <input type="radio" name="isPrivate" ng-model="venue.isPrivate" value="true" ng-value="true">\n            Private\n          </label>\n        </div>\n      </div>\n    </li>\n\n    <li class="list-group-item row">\n      <div class="col-xs-7">\n        <button class="btn btn-success btn-block" ida-submit="save(venue)">Save</button>\n      </div>\n      <div class="col-xs-5">\n        <button class="btn btn-default btn-block" ng-click="cancel(venue)">Cancel</button>\n      </div>\n    </li>\n  </ul>\n\n</div>\n'), n.put("/components/map/venue.html", '<div>\n  <div venuemarkers="venue" venuemarkers-own="{{isOwn()}}"></div>\n  <div class="list-group map-list-group">\n    <div class="list-group-item group-item-heading">\n\n      <!-- Edit context menu -->\n      <div class="btn-group pull-right dropdown animate-down hidden-xs"\n        ng-if="canEdit()"\n        ng-mouseenter="contextMenuOpen = true"\n        ng-mouseleave="contextMenuOpen = false"\n        >\n        <span class="icon icon-faded icon_cog"></span>\n        <ul class="dropdown-menu" ng-show="contextMenuOpen" role="menu">\n          <li><a ng-click="edit(venue)">Edit</a></li>\n          <li class="divider"></li>\n          <li class="danger"><a ng-click="remove(venue)">Delete</a></li>\n        </ul>\n      </div>\n      <!-- /Edit context menu -->\n\n      <div class="mainheader">\n        <span>\n          {{venue.name}}\n        </span>\n        {{venue.address}}\n      </div>\n\n    </div>\n\n    <div class="list-group-item group-item-description">\n      <div class="list-group-item-text">\n        <span\n          class="pull-right icon icon_lock icon-faded"\n          ng-show="venue.isPrivate">\n        </span>\n        {{venue.description}}\n      </div>\n    </div>\n\n    <div class="list-group-item list-group-scrollable">\n      <a\n        class="list-group-item appear"\n        ng-repeat="floorplan in floorplans | orderBy:[\'floorNumber\', \'name\']"\n        ui-sref="root.map.floorplan.info({ fpId: floorplan.id })">\n          {{floorplan.floorNumber}} - {{floorplan.name}}\n        <span> {{floorplan.description}} </span>\n      </a>\n    </div>\n    <div class="list-group-item row">\n      <div class="col-sm-5">\n        <button\n          class="btn btn-default btn-block"\n          ui-sref="root.map.venues({dontzoom: 1})"\n        >Close</button>\n      </div>\n      <div class="col-sm-7 hidden-xs">\n        <button\n          class="btn btn-success btn-block"\n          ng-if="canEdit()"\n          ui-sref="root.map.newfloorplan({venueId: venue.id})"\n          >Add floorplan\n        </button>\n      </div>\n    </div>\n  </div>\n</div>\n'), n.put("/components/map/venues.html", '<div>\n  <div venuemarkers="ownMapVenues" venuemarkers-type="own"></div>\n  <div venuemarkers="publicVenues" venuemarkers-type="pub"></div>\n\n  <header class="mapview-header">\n\n    <div\n      class=""\n      search\n      value="venue.address"\n      callback="searchSelect(target)"\n      >\n    </div>\n  </header>\n  <div class="list-group" ng-show="account.hasIdentity">\n    <div class="list-group-item group-item-heading map-list-group-item">\n      <button\n        ng-show="account.hasIdentity"\n        class="btn btn-sm btn-success pull-right"\n        ui-sref="root.map.newvenue"\n        >\n        Add venue\n      </button>\n\n      <div class="mainheader">\n        <span>\n          My venues <span class="small">({{pages.total}})</span>\n        </span>\n      </div>\n\n    </div>\n    <div\n      class="venues-list"\n      ng-class="{constantheight: pages.total > pages.limit}"\n      >\n      <a\n        class="list-group-item map-list-group-item group-item-description venues-list-item"\n        ng-repeat="venue in ownVenues | orderBy:[\'name\']"\n        ui-sref="root.map.venue.info({ venueId: venue.id })">\n          <div class="list-group-item-text">\n            {{venue.name}}\n          </div>\n          <div class="list-group-item-text">\n            <span class="small muted">\n              {{venue.address}}\n            </span>\n          </div>\n      </a>\n    </div>\n    <div class="list-group-item map-list-group-item" ng-show="ownVenues.length == 0">\n      <p class="list-group-item-text">\n        <span class="small muted">\n          <em> You dont have venues yet </em>\n        </span>\n      </p>\n    </div>\n\n    <div class="list-group-item map-list-group-item group-item-pagination" ng-show="pages.total > pages.limit">\n      <pagination\n        previous-text="&lsaquo;"\n        next-text="&rsaquo;"\n        first-text="&laquo;"\n        last-text="&raquo;"\n        total-items="pages.total"\n        items-per-page="pages.limit"\n        ng-model="pages.page"\n        ng-change="changePage()"\n        max-size="5"\n      >\n      </pagination>\n    </div>\n\n  </div>\n  <div class="list-group" ng-show="!account.hasIdentity">\n    <div class="list-group-item">\n      You need to <a ui-sref="root.login">login</a> to\n      be able to manage your own venues\n    </div>\n  </div>\n</div>\n'), n.put("/components/search/search-directive.html", '<div\n  role="search"\n  class="map-search input-group"\n  >\n  <input\n    type="text"\n    class="form-control"\n    placeholder="Search"\n    ng-model="search.value"\n    typeahead="venue as venue.label for venue in doSearch($viewValue)"\n    typeahead-loading="loadingLocations"\n    />\n</div>\n'), n.put("/components/search/search-result-directive.html", ""), n.put("/components/dashboard/dashboardbox/collect-data.html", '<div class="panel-body collect-data">\n  <a class="btn btn-success btn-block" ui-sref="root.help">Download mobile app</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/explore-map.html", '<div class="panel-body">\n  <div style="display: block;" class="center-block icon icon_marker-ida"></div>\n  <p>\n    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n  </p>\n  <a class="btn btn-success btn-block" ui-sref="root.map.venues">Explore</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/getting-started.html", '<div class="panel-body">\n  <div style="display: block;" class="center-block icon icon_rocket"></div>\n  <a ng-if="auth.hasIdentity" class="btn btn-success btn-block" ui-sref="root.help.gettingstarted">Get started</a>\n  <a ng-if="!auth.hasIdentity" class="btn btn-success btn-block" ui-sref="root.signup">Sign up now</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/my-apps.html", '<div\n  ng-if="data.length">\n  <div class="list-group">\n    <a class="list-group-item"\n      ng-repeat="app in data | limitTo: 5"\n      ui-sref="root.app.app({ appId: app.id })">\n      <p class="list-group-item-text">\n        {{app.name}}\n        <span class="small muted">\n          {{app.description}}\n        </span>\n      </p>\n    </a>\n  </div>\n  <div class="action">\n    <a ui-sref="root.app" class="btn btn-block btn-success">Manage apps</a>\n  </div>\n</div>\n<div class="panel-body my-apps" ng-if="!data.length">\n  <a class="btn btn-success btn-block" ui-sref="root.app">Create apps</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/my-venues.html", '<div\n  ng-if="data.length">\n  <div class="list-group">\n    <a\n      class="list-group-item"\n      ng-repeat="venue in data"\n      ui-sref="root.map.venue.info({ venueId: venue.id })">\n      <p class="list-group-item-text">\n        {{venue.name}}\n        <span class="small muted">\n          {{venue.description}}\n        </span>\n      </p>\n    </a>\n  </div>\n</div>\n<div class="panel-body my-venues" ng-if="!data.length">\n  <a class="btn btn-success btn-block" ui-sref="root.map.venues">Create venue</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/news.html", '<div class="list-group news-list-group fullwidth-list-group">\n\n  <a class="list-group-item news-list-group-item"\n    ng-repeat="news in data | limitTo: 2"\n    target="_blank"\n    ng-href="{{news.link}}">\n    <span class="small">{{news.date_gmt | amDateFormat:\'MMMM Do YYYY\'}}</span>\n    <p class="list-group-item-heading">\n      {{news.title}}\n    </p>\n    <p class="list-group-item-text">\n      {{news.excerpt}}\n    </p>\n  </a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/sign-up.html", '<div class="panel-body">\n  <div class="center-block icon icon_rocket"></div>\n  <p>\n    The positioning service powering location-based apps worldwide. Sign-up and start today.\n  </p>\n</div>\n<div class="action action-without-border">\n  <a class="btn btn-success btn-block" ui-sref="root.signup">Sign up</a>\n</div>\n'), n.put("/components/dashboard/dashboardbox/support.html", '<div class="panel-body">\n  <div class="center-block icon icon_support"></div>\n  <p>\n    Weâ€™re here to help with any questions or comments. If you just want to say hi, that\'s cool too.\n  </p>\n  <div class="action action-without-border">\n    <a class="btn btn-success btn-action btn-block" href="https://indooratlas.uservoice.com">Online support</a>\n  </div>\n</div>\n')
    }]),
    function() {
        "use strict";
        angular.module("idamaps").controller("HeaderCtrl", ["$scope", "$rootScope", function(n, e) {
            function t() {}
            n.auth = null, n.navbarCollapse = !0, n.auth = n.authenticator.getAccount();
            var a = "map";
            e.$on("map-layer-changed", function(n, e) {
                console.log("got map layer changed event", arguments), e && (a = e.header)
            }), n.navbarstyle = function() {
                return n.$state.includes("root.map.floorplan.analytics") ? void 0 : n.$state.includes("root.map") ? "navbar-" + a : n.$state.includes("root.login") || n.$state.includes("root.signup") || n.$state.includes("root.forgot-password") || n.$state.includes("root.dashboard") ? "navbar-login" : void 0
            }, n.$on("auth-login-success", function() {
                console.log("auth-login-success"), t()
            }), n.$on("auth-logout-success", function() {
                console.log("auth-logout-success"), t()
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps").controller("FooterCtrl", ["$scope", function(n) {
            n.showFooter = function() {
                return n.$state.includes("root.map") ? !1 : !0
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("intercom", []).run(["$rootScope", "intercom", function(n, e) {
            function t(n, t) {
                return t.id ? (e("boot", {
                    app_id: "zlcelrki",
                    name: t.username,
                    email: t.email,
                    user_id: t.id
                }), void 0) : (e("shutdown"), void 0)
            }
            n.$on("auth-account-updated", t), n.$on("$stateChangeSuccess", function() {
                e("update")
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("intercom").service("intercom", ["$window", function(n) {
            return function() {
                var e = n.Intercom;
                n.Intercom || (e = function() {
                    console.log("intercom:", arguments)
                }), e.apply(this, Array.prototype.slice.call(arguments))
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator", ["ngMessages"]).config(["$stateProvider", function(n) {
            n.state("root.signup", {
                url: "/signup",
                templateUrl: "/components/authenticator/signup.html",
                controller: "SignupCtrl"
            }).state("root.login", {
                url: "/login",
                templateUrl: "/components/authenticator/login.html",
                controller: "LoginCtrl"
            }).state("root.forgot-password", {
                url: "/forgot-password",
                templateUrl: "/components/authenticator/forgot-password.html",
                controller: "ForgotPasswordCtrl"
            }).state("root.logout", {
                url: "/logout",
                onEnter: ["idaAuthenticator", "$state", function(n, e) {
                    n.logout().then(function() {
                        e.transitionTo("root.dashboard")
                    }).catch(function(n) {
                        console.error(n)
                    })
                }]
            })
        }]).config(["$httpProvider", function(n) {
            n.interceptors.push("authenticatorInterceptor")
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator").service("idaAuthenticator", ["api", "$q", "$log", "$rootScope", function(n, e, t, a) {
            function o(e) {
                function t(n) {
                    return n.email && n.email.indexOf("@indooratlas.com") > -1
                }
                return e.id ? (e.email ? e.isAdmin = t(e) : n.one("users", e.id).get().then(function(n) {
                    e.email = n.email, e.isAdmin = t(n)
                }), r.user = e, r.user.route = "users", r.hasIdentity = !0) : (r.user = null, r.hasIdentity = !1), r.loaded = !0, i.resolve(r), a.$broadcast("auth-account-updated", e), e
            }
            var i = e.defer(),
                r = {
                    loaded: !1,
                    hasIdentity: null,
                    user: null
                },
                s = {};
            return s.init = function() {
                return s.getStatus()
            }, s.isAuthenticated = function() {
                return r.loaded && r.hasIdentity
            }, s.getAccount = function() {
                return r.loaded ? r : i.promise
            }, s.getStatus = function() {
                n.one("auth").get().then(function(n) {
                    return o(n)
                })
            }, s.login = function(e) {
                return n.all("auth").post(e).then(function(n) {
                    return a.$broadcast("auth-login-success", n), o(n)
                })
            }, s.logout = function() {
                return n.all("auth").remove().then(function() {
                    return a.$broadcast("auth-logout-success"), o({})
                })
            }, s.signup = function(e) {
                return n.all("users").post(e).then(function(n) {
                    return a.$broadcast("auth-register-success"), o(n)
                })
            }, s.forgotPassword = function(e) {
                return n.all("password_reset").post(e).then(function() {
                    return a.$broadcast("auth-passwordreset-success"), !0
                })
            }, s.changePassword = function() {
                throw a.$broadcast("auth-change-password-success"), new Error("not implemented yet")
            }, s
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator").controller("LoginCtrl", ["$scope", function(n) {
            n.account.then(function(e) {
                e.hasIdentity && n.$state.go("root.dashboard")
            }), n.login = {}, n.submit = function() {
                return n.error = !1, n.authenticator.login(n.login).then(function() {
                    return n.$state.go("root.dashboard")
                }).catch(function(e) {
                    n.error = e.data.message
                })
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator").controller("SignupCtrl", ["$scope", "$state", "formErrorHelper", "errorParser", function(n, e, t, a) {
            n.account.then(function(e) {
                e.hasIdentity && n.$state.go("root.dashboard")
            }), n.signup = {}, n.submit = function() {
                return t.clearErrors(n.signupForm), n.error = !1, n.authenticator.signup(n.signup).then(function() {
                    return e.go("root.dashboard")
                }).catch(function(e) {
                    n.error = a.parse(e), t.assignError(n.signupForm, n.error)
                })
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator").controller("ForgotPasswordCtrl", ["$scope", "formErrorHelper", "errorParser", function(n, e, t) {
            n.account = {}, n.error = !1, n.success = !1, n.submit = function() {
                return e.clearErrors(n.forgotForm), n.error = !1, n.success = !1, n.authenticator.forgotPassword(n.account).then(function() {
                    n.success = "Check your inbox!"
                }).catch(function(a) {
                    n.error = t.parse(a), e.assignError(n.forgotForm, n.error)
                })
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.authenticator").factory("authenticatorInterceptor", ["$q", "$log", "$injector", function(n, e, t) {
            return {
                request: function(n) {
                    return n
                },
                requestError: function(t) {
                    return e.error("authenticator requestError", JSON.stringify(t)), n.reject(t)
                },
                response: function(n) {
                    return n
                },
                responseError: function(a) {
                    if (401 === a.status) {
                        e.error("responseError 401", JSON.stringify(a));
                        var o = t.get("idaAuthenticator"),
                            i = t.get("$state");
                        return o.logout().then(function() {
                            return i.go("root.login"), n.reject(a)
                        })
                    }
                    return n.reject(a)
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.api", ["restangular"]).config(["RestangularProvider", function(n) {
            function e(n) {
                var e = /([a-zA-Z]+)\ (\d+)\-(\d+)\/(\d+)/,
                    t = e.exec(n);
                return {
                    from: parseInt(t[2], 10),
                    to: parseInt(t[3], 10),
                    max: parseInt(t[4], 10)
                }
            }
            var t = window.apiDomain ? window.apiDomain : "api.indooratlas.com";
            n.setBaseUrl("//" + t), n.setDefaultHttpFields({
                withCredentials: !0
            }), n.setRestangularFields({
                id: "id"
            }), n.setRequestInterceptor(function(n, e) {
                return "remove" === e ? void 0 : n
            }), n.addFullRequestInterceptor(function(n, e, t, a, o, i) {
                var r = i.range;
                return r && (i.range = void 0, o.range = ["items", "=", r.from, "-", r.to].join("")), {
                    headers: o,
                    params: i,
                    element: n
                }
            }), n.addResponseInterceptor(function(n, t, a, o, i) {
                var r = i.headers("content-range");
                if (r) try {
                    var s = e(r);
                    n.range = s
                } catch (l) {
                    console.error("range header parsing failed, ignoring", l)
                }
                return n
            })
        }]).factory("api", ["Restangular", "$cacheFactory", function(n, e) {
            return n.addFullRequestInterceptor(function(n, t, a, o, i, r) {
                var s;
                return i.range ? (s = e.get(o + i.range), s || (s = e(o + i.range))) : s = !0, s = !1, {
                    headers: i,
                    params: r,
                    element: n,
                    httpConfig: {
                        cache: s
                    }
                }
            }), n
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.errorHandler", []).config(["$provide", function(n) {
            n.decorator("$exceptionHandler", ["$delegate", "$injector", "$window", function(n, e, t) {
                return function(a, o) {
                    t.trackJs && t.trackJs.track(a);
                    var i = e.get("$rootScope");
                    i.addError(a, o), n(a, o)
                }
            }])
        }]).run(["$rootScope", "$log", function(n, e) {
            n.addError = function(t, a) {
                e.error(a), e.error(t), n.errors = !0
            }, n.$on("$stateChangeError", function(e, t, a, o, i, r) {
                n.addError(r, e)
            })
        }])
    }(),
    function() {
        "use strict";

        function n() {
            this.errorMessage = "", this.validations = [], this.statusCode
        }

        function e(n) {
            var e = n.status;
            return e || (e = 500), e
        }

        function t(n) {
            var e = n.data || {},
                t = e.errors || !1;
            return t
        }

        function a(n) {
            var e = n.data || {},
                t = e.message || e.Message || n.statusText;
            return "Validation error" === t ? !1 : t
        }

        function o(n) {
            var e = n.data || {},
                t = e.ModelState || !1,
                a = !1;
            return t && (a = [], _.forEach(t, function(n, e) {
                console.log(n, e);
                var t = e.split(".");
                console.log(t);
                var o;
                t.length > 1 && (e = t[0].toLowerCase()), o = n[0], a.push({
                    property: e,
                    msg: o
                })
            })), console.log("parseModelState", a), a
        }
        n.prototype.toString = function() {
            return this.errorMessage
        }, n.prototype.formValidations = function() {
            return this.validations
        }, angular.module("idamaps.errorHandler").service("errorParser", [function() {
            function i(i) {
                var r = new n,
                    s = r.statusCode = e(i);
                return 422 === s && (r.validations = t(i)), console.log("errorParser", i.data), i.data.ModelState && (console.log("errorParser", "Deprecated modelstate error return"), r.validations = o(i)), r.errorMessage = a(i), r
            }
            return {
                parse: i
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.errorHandler").filter("formatError", [function() {
            return function(n) {
                if (!n) return null;
                if ("string" == typeof n) return "The Position field is required." === n ? "Please set location with marker" : n;
                try {
                    var e = n.formValidations() || [];
                    return e.length > 0 ? !1 : n.toString()
                } catch (t) {
                    return t.toString()
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.account", []).config(["$stateProvider", function(n) {
            n.state("root.account", {
                url: "/account",
                "abstract": !0,
                templateUrl: "/components/account/index.html"
            }).state("root.account.settings", {
                url: "/settings",
                templateUrl: "/components/account/settings.html",
                controller: "AccountSettingsCtrl",
                resolve: {
                    accountDetails: ["api", "account", function(n, e) {
                        return n.one("users", e.user.id).get()
                    }]
                }
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.account").controller("AccountSettingsCtrl", ["$scope", "accountDetails", "formErrorHelper", "errorParser", function(n, e, t, a) {
            console.log(e), n.foo = "bar", n.accountDetails = e, n.submit = function() {
                return t.clearErrors(n.detailsForm), n.detailsError = !1, e.put().then(function() {
                    n.detailsSuccess = "Saved"
                }).catch(function(e) {
                    try {
                        t.assignError(n.detailsForm, e)
                    } catch (a) {
                        n.detailsError = e
                    }
                })
            }, n.passwords = {}, n.newPasswordVerification = "", n.submitPassword = function() {
                t.clearErrors(n.passwordForm), n.passwordError = !1, n.passwordSuccess = !1;
                var o = e.one("password");
                return o.newPassword = n.passwords.newPassword, o.oldPassword = n.passwords.oldPassword, o.put().then(function() {
                    n.passwordSuccess = "Saved", n.passwords = {
                        newPassword: "",
                        oldPassword: "",
                        newPasswordVerification: ""
                    }, n.passwordForm.$setPristine(!0)
                }).catch(function(e) {
                    n.error = a.parse(e), t.assignError(n.passwordForm, n.error)
                })
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.dashboard", []).config(["$stateProvider", function(n) {
            n.state("root.dashboard", {
                url: "/dashboard",
                views: {
                    "": {
                        templateUrl: "/components/dashboard/index.html",
                        controller: "DashboardCtrl"
                    }
                }
            }).state("root.guide", {
                url: "/guide",
                views: {
                    "": {
                        templateUrl: "/components/dashboard/guide.html",
                        controller: "GuideCtrl"
                    }
                }
            })
        }]).directive("openVimeo", ["$modal", function(n) {
            function e(n) {
                return ["//player.vimeo.com/video/" + n + "?title=0", "byline=0", "portrait=0", "autoplay=1", "color=00a5f5"].join("&amp;")
            }

            function t(t, a) {
                a.bind("click", function() {
                    var a = '<iframe frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen width="500" height="281" src="' + e(t.vimeoId) + '"></iframe>',
                        o = n.open({
                            template: a,
                            size: "lg",
                            windowClass: "modal-vimeo"
                        });
                    console.log(o)
                })
            }
            return {
                link: t,
                scope: {
                    vimeoId: "=openVimeo"
                }
            }
        }])
    }(), angular.module("idamaps.dashboard").directive("dashboardbox", ["$compile", function(n) {
        function e(n) {
            return n
        }

        function t(t, a, o) {
            var i = n(e(t))(o);
            a.children().append(i)
        }
        return {
            replace: !0,
            link: function(n, e) {
                var a = n.box;
                n.loading = !1, n.templateUrl = function() {
                    return a.templateUrl ? "/components/dashboard/" + a.templateUrl : null
                }, a.waitFor ? (n.loading = !0, n[a.waitFor].then(function(o) {
                    n.data = o, a.templateUrl || t(a.content, e, n), n.loading = !1
                })) : a.templateUrl || t(a.content, e, n)
            },
            templateUrl: "/components/dashboard/dashboardbox-directive.html"
        }
    }]), angular.module("idamaps.dashboard").factory("DashboardBox", ["$log", function(n) {
        return {
            get: function(e) {
                n.debug("account", e);
                var t = [];
                return t = t.concat([{
                    title: "IndoorAtlas news",
                    templateUrl: "dashboardbox/news.html",
                    waitFor: "news",
                    collapsed: !1
                }, {
                    title: "Support",
                    templateUrl: "dashboardbox/support.html",
                    collapsed: !1
                }]), t = e.hasIdentity ? t.concat([{
                    title: "My venues",
                    waitFor: "venues",
                    templateUrl: "dashboardbox/my-venues.html",
                    collapsed: !1
                }]) : t.concat([{
                    title: "Join IndoorAtlas",
                    templateUrl: "dashboardbox/sign-up.html",
                    collapsed: !1
                }])
            }
        }
    }]),
    function() {
        "use strict";
        angular.module("idamaps.dashboard").controller("DashboardCtrl", ["$scope", "account", "DashboardBox", "api", function(n, e, t, a) {
            n.news = a.all("news").getList({
                limit: 2
            }), e.hasIdentity && (n.venues = e.user.all("venues").getList(), n.apps = e.user.all("applications").getList()), n.auth = e, n.boxes = t.get(e), n.toggle = function(n) {
                n.collapsed = !n.collapsed
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.dashboard").controller("GuideCtrl", ["$scope", function() {}])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.help", []).config(["$stateProvider", function(n) {
            n.state("root.help", {
                url: "/help",
                template: "<ui-view/>"
            }).state("root.help.ios", {
                url: "/ios",
                templateUrl: "/components/help/getting-started-ios.html"
            }).state("root.help.android", {
                url: "/android",
                templateUrl: "/components/help/getting-started-android.html"
            }).state("root.help.downloads", {
                url: "^/downloads",
                templateUrl: "/components/help/downloads.html",
                controller: "DownloadsCtrl",
                resolve: {
                    downloads: ["api", function(n) {
                        return n.all("sdks").getList()
                    }]
                }
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.help").directive("gist", ["$http", function(n) {
            function e(e, t) {
                function a(n) {
                    e.loading = !1, t.append('<link rel="stylesheet" href="' + n.stylesheet + '" />'), t.append(n.div)
                }
                var o = e.gistId;
                if (o) {
                    e.loading = !0;
                    var i = "https://gist.github.com/" + o + ".json?callback=JSON_CALLBACK";
                    n.jsonp(i).success(function(n) {
                        a(n)
                    })
                }
            }
            return {
                restrict: "A",
                link: e,
                template: '<div class="loading" ng-show="loading">Loading</div>',
                scope: {
                    gistId: "@gist"
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps").controller("HelpCtrl", function() {})
    }(),
    function() {
        "use strict";
        angular.module("idamaps.help").controller("DownloadsCtrl", ["$scope", "downloads", function(n, e) {
            n.apps = [{
                name: "IndoorAtlas Mobile for iOS",
                description: "Use IndoorAtlas Mobile for iOS to record sensor data, to create maps, and to test positioning.",
                downloadUrl: "https://itunes.apple.com/us/app/indooratlas/id720005234"
            }, {
                name: "IndoorAtlas Mobile for Android",
                description: "Use IndoorAtlas Mobile for Android to record sensor data, to create maps, and to test positioning.",
                downloadUrl: "https://play.google.com/store/apps/details?id=com.indooratlas.mapcreator.main"
            }, {
                name: "IndoorAtlas Mobile for Android",
                description: "Direct download link for users without Play Store access.",
                downloadUrl: "http://web.indooratlas.com/pub/indooratlas-android-mapcreator-1.4.2-44-beta-release.apk"
            }], n.account.then(function(e) {
                e.hasIdentity || n.$state.go("root.login")
            }), n.sdks = [], e.forEach(function(e) {
                switch (e.type.toLowerCase()) {
                    case "android":
                    case "ios":
                        n.sdks.push(e);
                        break;
                    default:
                        console.log(e)
                }
            }), n.downloadUrl = function(n) {
                if (n.downloadUrl) return n.downloadUrl;
                var e = n.getRequestedUrl();
                return e += "/download"
            }
        }])
    }(),
    function() {
        "use strict";
        var n = "/components/map";
        angular.module("idamaps.map", ["idamaps.filereader"]).config(["$stateProvider", function(e) {
            e.state("root.map", {
                "abstract": !0,
                templateUrl: n + "/index.html",
                controller: "MapCtrl"
            }).state("root.map.venues", {
                url: "/venues?page&dontzoom",
                views: {
                    mapview: {
                        templateUrl: n + "/venues.html",
                        controller: "VenuesCtrl"
                    }
                },
                resolve: {
                    rangeRequest: ["$stateParams", function(n) {
                        var e = n.page || 1,
                            t = 7,
                            a = {
                                from: t * (e - 1),
                                to: t * e - 1,
                                limit: t,
                                page: e
                            };
                        return a
                    }],
                    venues: ["api", "account", "$state", "rangeRequest", function(n, e, t, a) {
                        var o = e.user;
                        return o ? o.all("venues").getList({
                            range: a
                        }).catch(function(n) {
                            var e = n.status;
                            if (416 === e) return t.go("root.map.venues"), [];
                            throw n
                        }) : []
                    }]
                }
            }).state("root.map.newvenue", {
                url: "/newvenue",
                data: {
                    leaveProtection: !0
                },
                views: {
                    mapview: {
                        templateUrl: n + "/newvenue.html",
                        controller: "NewVenueCtrl"
                    }
                }
            }).state("root.map.venue", {
                url: "/venue/:venueId",
                "abstract": !0,
                resolve: {
                    venue: ["api", "$stateParams", "$state", "$log", function(n, e, t, a) {
                        return n.one("venues", e.venueId).get().catch(function(n) {
                            a.error(n), t.transitionTo("root.map.venues")
                        })
                    }]
                }
            }).state("root.map.venue.info", {
                url: "",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/venue.html",
                        controller: "VenueCtrl"
                    }
                }
            }).state("root.map.venue.edit", {
                url: "/edit",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/newvenue.html",
                        controller: "VenueEditCtrl"
                    }
                }
            }).state("root.map.venue.remove", {
                url: "/remove",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/venue-remove.html",
                        controller: "VenueRemoveCtrl"
                    }
                }
            }).state("root.map.newfloorplan", {
                url: "/newfloorplan/:venueId",
                data: {
                    leaveProtection: !0
                },
                views: {
                    mapview: {
                        templateUrl: n + "/newfloorplan.html",
                        controller: "NewFloorplanCtrl"
                    }
                },
                resolve: {
                    venue: ["api", "$stateParams", "$state", "$log", function(n, e, t, a) {
                        return n.one("venues", e.venueId).get().catch(function(n) {
                            a.error(n), t.transitionTo("root.map.venues")
                        })
                    }]
                }
            }).state("root.map.floorplan", {
                url: "/floorplan/:fpId",
                "abstract": !0,
                resolve: {
                    floorplan: ["api", "$stateParams", function(n, e) {
                        return n.one("floorplans", e.fpId).get()
                    }],
                    venue: ["api", "floorplan", function(n, e) {
                        var t = e.floor.venue.id;
                        return n.one("venues", t).get()
                    }]
                }
            }).state("root.map.floorplan.info", {
                url: "",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/floorplan.html",
                        controller: "FloorplanCtrl"
                    }
                },
                resolve: {
                    mapStatus: ["floorplan", function(n) {
                        return n.oneUrl("map_status").get()
                    }]
                }
            }).state("root.map.floorplan.analytics", {
                url: "/analytics",
                views: {
                    "mapviewFixed@root.map": {
                        templateUrl: n + "/floorplan-analytics.html",
                        controller: "FloorplanAnalyticsCtrl"
                    }
                },
                resolve: {
                    analytics: ["floorplan", function(n) {
                        return n.oneUrl("analytics").get()
                    }]
                }
            }).state("root.map.floorplan.edit", {
                url: "/edit",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/newfloorplan.html",
                        controller: "FloorplanEditCtrl"
                    }
                }
            }).state("root.map.floorplan.remove", {
                url: "/remove",
                views: {
                    "mapview@root.map": {
                        templateUrl: n + "/floorplan-remove.html",
                        controller: "FloorplanRemoveCtrl"
                    }
                }
            })
        }]).service("Leaflet", ["$window", function(n) {
            var e = n.L;
            return e
        }]).directive("map", ["Leaflet", function(n) {
            return {
                replace: !0,
                template: '<div class="leaflet-map"></div>',
                link: function(e, t) {
                    n.Icon.Default.imagePath = "//img/";
                    var a = n.map(t[0], {
                        center: [51.505, -.09],
                        zoom: 13,
                        zoomControl: !1,
                        attributionControl: !1,
                        boxZoom: !1,
                        scrollWheelZoom: !1,
                        minZoom: 3
                    }).setActiveArea("active-area");
                    e.map = a
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("MapCtrl", ["$scope", function(n) {
            n.foo = "bar"
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("VenuesCtrl", ["$scope", "VenuesHelper", "account", "venues", "rangeRequest", "$stateParams", function(n, e, t, a, o, i) {
            if (n.account = t, !t.hasIdentity) return n.$state.go("root.login"), void 0;
            n.ownVenues = a, n.publicVenues = [];
            var r = a.range;
            if (r) {
                n.pages = {
                    page: o.page,
                    limit: o.limit,
                    total: r.max
                };
                var s = o.page;
                n.changePage = function() {
                    console.log(s, n.pages.page), s !== n.pages.page && n.$state.go(".", {
                        page: n.pages.page,
                        dontzoom: 1
                    })
                }
            }
            n.searchSelect = function(e) {
                e.id ? n.$state.go("root.map.venue.info", {
                    venueId: e.id
                }) : n.map.setView([e.lat, e.lng], 16, {
                    animate: !0
                })
            }, n.ownMapVenues = [];
            var l = function() {
                e.queryMapVenues(n.map, t).then(function(e) {
                    n.publicVenues = e.public, n.ownMapVenues = e.own
                }).catch(function() {
                    n.publicVenues = [], n.ownMapVenues = []
                })
            };
            n.map.on("moveend", l), n.$on("$destroy", function() {
                n.map.off("moveend", l)
            });
            var c = !i.dontzoom;
            c && a.length ? e.centerMapToVenues(a, n.map) : l()
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("NewVenueCtrl", ["$scope", "api", "geocoder", "cancelPreventer", "formErrorHelper", "errorParser", function(n, e, t, a, o, i) {
            n.newVenue = !0, n.venue = {
                isPrivate: !1
            };
            var r = n.map;
            r.setZoom(16, {
                animate: !0
            }), n.$watch("venue.location", function(e) {
                e && t.reverse(e).then(function(e) {
                    n.venue.address = e.name.join(", ")
                })
            }), n.searchSelect = function(e) {
                if (e) {
                    var t;
                    t = e.id ? e.location : [e.lat, e.lng], n.map.setView(t, 16, {
                        animate: !0
                    }), n.venue.location = t
                }
            }, n.submit = function() {
                return o.clearErrors(n.venueForm), n.error = !1, e.all("venues").post(n.venue).then(function(e) {
                    a.disable(), n.$state.go("root.map.venue.info", {
                        venueId: e.id
                    })
                }).catch(function(e) {
                    n.error = i.parse(e), o.assignError(n.venueForm, n.error)
                })
            }, n.cancel = function() {
                n.venueForm.$dirty || a.disable(), n.$state.go("root.map.venues")
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("VenueCtrl", ["$scope", "VenuesHelper", "venue", "account", function(n, e, t, a) {
            return t && t.location ? (n.venue = t, e.centerToVenue(t, n.map), n.floorplans = e.parseFloorplans(t), n.canEdit = e.canEdit.bind(e, a, t), n.isOwn = e.isOwn.bind(e, a, t), n.edit = function() {
                n.$state.go("^.edit")
            }, n.remove = function() {
                n.$state.go("^.remove")
            }, void 0) : (n.$state.transitionTo("root.map.venues"), void 0)
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("VenueEditCtrl", ["$scope", "VenuesHelper", "venue", "errorParser", "formErrorHelper", function(n, e, t, a, o) {
            n.newVenue = !1, n.venue = t.clone(), e.centerToVenue(t, n.map), n.submit = function(t) {
                return o.clearErrors(n.venueForm), n.error = !1, e.updateVenue(t).then(function() {
                    n.$state.go("^.info", null, {
                        reload: !0
                    })
                }).catch(function(e) {
                    n.error = a.parse(e), o.assignError(n.venueForm, n.error)
                })
            }, n.cancel = function() {
                n.$state.go("^.info")
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("VenueRemoveCtrl", ["$scope", "VenuesHelper", "venue", function(n, e, t) {
            n.submit = function() {
                return e.removeVenue(t).then(function() {
                    n.$state.transitionTo("root.map.venues")
                })
            }, n.cancel = function() {
                n.$state.go("^.info")
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("FloorplanCtrl", ["$window", "$scope", "floorplan", "mapStatus", "FloorplansHelper", "account", "venue", function(n, e, t, a, o, i, r) {
            e.venue = r, e.floorplan = t, e.mapStatus = a, e.canEdit = o.canEdit.bind(e, i, t), e.analyticsAvailable = function(n) {
                return n && n.latestMapGeneration ? n.latestMapGeneration.isSuccess ? e.canEdit() : !1 : !1
            }, e.markers = [], o.formatDtoToFloorplanner(t, e.markers);
            var s = o.createFloorplanView(t, e.map).showImage().showMarkers().center();
            e.$on("$destroy", function() {
                delete n.triggerMap, s.destroy()
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("NewFloorplanCtrl", ["$scope", "VenuesHelper", "FloorplansHelper", "venue", "cancelPreventer", "formErrorHelper", "errorParser", "$q", function(n, e, t, a, o, i, r, s) {
            n.newFloorplan = !0, n.venue = a, n.settings = {
                opacity: .7,
                advanced: !1
            }, n.floorplan = {}, n.innerform = [], n.dimensions = {}, n.markers = [], n.submit = function() {
                var l = t.formatFloorplanToOldDto(n.floorplan, n.markers),
                    c = {
                        name: n.floorplan.level,
                        floorNumber: n.floorplan.level
                    };
                i.clearErrors(n.form);
                var d = !1;
                return e.searchLevelInVenue(a, n.floorplan.level, c).catch(function(e) {
                    return n.form.level.$error.server = "Floor number cannot be empty", n.form.level.$invalid = !0, console.log("searchLevelInVenue", JSON.stringify(e)), d = !0, s.reject(e)
                }).then(function(n) {
                    return n.all("floorplans").post(l)
                }).then(function(e) {
                    o.disable(), n.$state.transitionTo("root.map.floorplan.info", {
                        fpId: e.id
                    })
                }).catch(function(e) {
                    return d ? s.reject(e) : (n.error = r.parse(e), i.assignError(n.form, n.error), console.log("postFloorplan", JSON.stringify(e)), s.reject(e), void 0)
                })
            }, n.cancel = function() {
                n.form.$dirty || o.disable(), n.$state.go("root.map.venue.info", {
                    venueId: a.id
                })
            }, e.centerToVenue(a, n.map, {
                zoom: 19
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("FloorplanAnalyticsCtrl", ["$scope", "analytics", "floorplan", "account", function(n, e, t, a) {
            function o(e) {
                console.log(e), n.analytics = e, n.errorCase = e ? e.tests[r] && -1 !== e.tests[r].perc75 ? e.tests[r].validationCoverageImageUrl ? 0 : 1 : 4 : 5, console.log(n.errorCase)
            }

            function i() {
                n.mapGenerating = !0, t.oneUrl("generate_map").post().then(function() {
                    n.mapGenError = !1, n.mapGenerating = !1, console.log("generate map")
                }, function(e) {
                    n.mapGenerating = !1, n.mapGenError = e.data.message
                })
            }
            if (!a.hasIdentity) return n.$state.go("root.login");
            n.showDebug = !!(a.user || {}).isAdmin, n.floorplan = t;
            var r = n.testIndex = 0;
            o(e), n.updateAnalytics = function() {
                t.oneUrl("analytics").get().then(function(n) {
                    return o(n)
                })
            }, window.updateAnalytics = n.updateAnalytics, n.mapGenError = !1, n.mapGenerating = !1, n.triggerMapGeneration = i, window.triggerMapGen = i
        }]).filter("secondsToHumanReadable", [function() {
            return function(n) {
                var e = Math.floor(n / 86400),
                    t = Math.floor(n % 86400 / 3600),
                    a = Math.floor(n % 86400 % 3600 / 60),
                    o = "";
                return e > 0 && (o += e > 1 ? e + " days " : e + " day "), t > 0 && (o += t > 1 ? t + " hours " : t + " hour "), a >= 0 ? o += a > 1 ? a + " minutes " : a + " minute " : 0 === a && "" === o && (o = n > 1 ? n + " seconds" : n + " second"), o
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("FloorplanEditCtrl", ["$scope", "VenuesHelper", "FloorplansHelper", "floorplan", "venue", "cancelPreventer", "formErrorHelper", "errorParser", function(n, e, t, a, o, i, r, s) {
            n.newFloorplan = !1, n.floorplan = a, n.venue = o, n.settings = {
                opacity: .7,
                advanced: !1
            }, n.dimensions = {
                width: "100m",
                height: "200m"
            }, n.markers = [], t.formatDtoToFloorplanner(a, n.markers), n.submit = function() {
                var e = t.formatFloorplanToOldDto(n.floorplan, n.markers);
                return a.name = e.name, a.markers = e.markers, r.clearErrors(n.form), a.put().then(function() {
                    i.disable(), n.$state.go("^.info", null, {
                        reload: !0
                    })
                }).catch(function(e) {
                    n.error = s.parse(e), r.assignError(n.form, n.error)
                })
            }, n.cancel = function() {
                n.$state.go("^.info")
            };
            var l = t.createFloorplanView(a, n.map).center();
            n.$on("$destroy", function() {
                l.destroy()
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").controller("FloorplanRemoveCtrl", ["$scope", "FloorplansHelper", "floorplan", "venue", function(n, e, t, a) {
            n.submit = function() {
                return e.removeFloorplan(t).then(function() {
                    n.$state.transitionTo("root.map.venue.info", {
                        venueId: a.id
                    })
                })
            };
            var o = e.createFloorplanView(t, n.map).showImage().showMarkers().center();
            n.$on("$destroy", function() {
                o.destroy()
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("editInPlace", [function() {
            function n(n, e) {
                e.addClass("edit-in-place"), n.$watch("edit", function(n) {
                    console.log("editing", n), n ? e.addClass("active") : e.removeClass("active")
                })
            }
            return {
                link: n,
                restrict: "E",
                template: '<span ng-bind="value"></span><div class="edit" ng-transclude></div>',
                transclude: !0,
                scope: {
                    value: "=",
                    edit: "="
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("mapZoom", [function() {
            return {
                replace: !0,
                templateUrl: "/components/map/mapzoom-directive.html",
                link: function(n) {
                    var e = n.map;
                    n.zoomIn = function() {
                        e.zoomIn()
                    }, n.zoomOut = function() {
                        e.zoomOut()
                    }
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("mapLayers", ["Leaflet", function(n) {
            var e = [{
                key: "MapBox.indooratlas.k4e5o551",
                name: "MapBox",
                header: "map",
                options: {
                    detectRetina: !0,
                    maxZoom: 23
                }
            }, {
                key: "MapBox.indooratlas.map-uhlzu7ye",
                name: "MapBox Sat.",
                header: "map-sat",
                options: {
                    detectRetina: !0,
                    maxNativeZoom: 20,
                    maxZoom: 23
                }
            }, {
                key: "HERE.normalDay",
                name: "Here",
                header: "map",
                options: {
                    app_id: "KlghgHkGA0DsPjeW1zPl",
                    app_code: "rG6Gi2LrY4f0T3qBevPudw",
                    maxNativeZoom: 20,
                    maxZoom: 22
                }
            }, {
                key: "HERE.satelliteDay",
                name: "Here Sat.",
                header: "map-sat",
                options: {
                    app_id: "KlghgHkGA0DsPjeW1zPl",
                    app_code: "rG6Gi2LrY4f0T3qBevPudw",
                    maxNativeZoom: 20,
                    maxZoom: 22
                }
            }];
            return {
                replace: !0,
                templateUrl: "/components/map/maplayers-directive.html",
                link: function(t) {
                    var a = t.map,
                        o = {};
                    e.forEach(function(e) {
                        o[e.name] = n.tileLayer.provider(e.key, e.options), o[e.name].header = e.header
                    }), t.menuOpen = !1, t.select = function(n) {
                        a.removeLayer(o[t.currentLayer]), t.currentLayer = n;
                        var e = o[t.currentLayer];
                        t.$emit("map-layer-changed", e), e.addTo(a), t.menuOpen = !1
                    }, t.currentLayer = "MapBox", o[t.currentLayer].addTo(a), t.layers = o
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("venuemarkers", ["Leaflet", function(n) {
            function e(e, t, a) {
                var o = 3,
                    i = [120, 192].map(function(n) {
                        return Math.floor(n / o)
                    }),
                    r = [53, 188].map(function(n) {
                        return Math.floor(n / o)
                    }),
                    s = [0, -188].map(function(n) {
                        return Math.floor(n / o)
                    }),
                    l = {
                        pub: new n.icon({
                            iconUrl: "/img/icon_marker-public.svg",
                            iconSize: i,
                            iconAnchor: r,
                            popupAnchor: s
                        }),
                        own: new n.icon({
                            iconUrl: "/img/icon_marker.svg",
                            iconSize: i,
                            iconAnchor: r,
                            popupAnchor: s
                        })
                    },
                    c = e.map,
                    d = n.featureGroup().addTo(c),
                    u = a.venuemarkersType;
                u || (u = "own", a.venuemarkersOwn && "false" === a.venuemarkersOwn && (u = "pub")), e.$watch(a.venuemarkers, function(t) {
                    angular.isArray(t) || (t = [t]);
                    try {
                        d.clearLayers()
                    } catch (a) {}
                    t.forEach(function(t) {
                        var a = n.marker(t.location, {
                                icon: l[u]
                            }),
                            o = !1;
                        a.on("mouseover", function(n) {
                            o || (o = !0, n.target.bindPopup(t.name).openPopup())
                        }), a.on("mouseout", function(n) {
                            o = !1, n.target.closePopup()
                        }), a.on("click", function() {
                            e.$state.go("root.map.venue.info", {
                                venueId: t.id
                            })
                        }), d.addLayer(a)
                    })
                }), e.$on("$destroy", function() {
                    try {
                        d.clearLayers()
                    } catch (n) {}
                })
            }
            return {
                link: e
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("search", [function() {
            function n() {}
            var e = ["$scope", "geocoder", "api", "$q", function(n, e, t, a) {
                function o(n) {
                    return t.all("venues").getList({
                        search: n
                    })
                }

                function i(n) {
                    return e.search(n)
                }

                function r(n) {
                    return a.all([i(n), o(n)]).then(function(n) {
                        var e = Array.prototype.concat.apply([], n);
                        return e.filter(function(n) {
                            return !!n
                        })
                    }).then(function(n) {
                        return n.map(function(n) {
                            return n.label = n.name + ", " + n.address, n.importance || (n.importance = .9), n
                        })
                    })
                }
                n.doSearch = r, n.$watch("search.value", function(e) {
                    e && "string" != typeof e && (console.log("selected", e), n.select(e))
                }), n.select = function(e) {
                    n.callback({
                        target: e
                    })
                }
            }];
            return {
                templateUrl: "/components/search/search-directive.html",
                replace: !0,
                controller: e,
                link: n,
                scope: {
                    value: "=",
                    callback: "&"
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("floorplanRotate", ["Leaflet", "$timeout", function(n, e) {
            function t(t) {
                function a() {
                    return u ? u : (console.log("create planner"), u = (new n.Floorplanner).addTo(d), u.setAdvanced("advanced"), u.on("transform", function() {
                        var n = u.getMarkers();
                        e(function() {
                            t.markers = n
                        })
                    }), u)
                }

                function o() {
                    u && d.removeLayer(u), u = !1
                }

                function i(n) {
                    n && (a().setOpacity(n), a().getMarkers())
                }

                function r(n) {
                    n || (n = !1), a().setAdvanced(n)
                }

                function s(n, e) {
                    n && (e && (console.log("old image yep", e), o()), a().setUrl(n))
                }

                function l(e) {
                    var a = e.map(function(e) {
                        return n.latLng([e.lat, e.lng])
                    });
                    try {
                        t.dimensions.height = a[0].distanceTo(a[1]), t.dimensions.width = a[0].distanceTo(a[2]), t.dimensions.depth = a[1].distanceTo(a[2])
                    } catch (o) {
                        t.dimensions.height = 0, t.dimensions.width = 0, t.dimensions.depth = 0
                    }
                }

                function c(n) {
                    t.form && t.form.$invalid || (l(n), a().setMarkers(n))
                }
                var d = t.mapInstance,
                    u = !1;
                t.$watch("opacity", i), t.$watch("image", s), t.$watch("advanced", r), t.$watch("markers", c, !0), t.$on("$destroy", function() {
                    o()
                })
            }
            return {
                link: t,
                scope: {
                    advanced: "=",
                    opacity: "=",
                    markers: "=",
                    image: "=",
                    mapInstance: "=",
                    form: "=markerForm",
                    dimensions: "=calculatedDimensions"
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").factory("VenuesHelper", ["api", function(n) {
            function e(e) {
                var t = e.getCenter().wrap(),
                    a = e.getBounds().getNorthEast().wrap(),
                    o = Math.round(a.distanceTo(t));
                return n.all("venues").getList({
                    latlon: t.lat + "," + t.lng,
                    radius: o
                })
            }

            function t(e, t) {
                var a = e.getCenter().wrap(),
                    o = e.getBounds().getNorthEast().wrap(),
                    i = Math.round(o.distanceTo(a)),
                    r = t.user.id;
                return n.all("venues").getList({
                    latlon: a.lat + "," + a.lng,
                    radius: i
                }).then(function(n) {
                    var e = [],
                        t = [];
                    return n.forEach(function(n) {
                        n.createdBy === r ? e.push(n) : t.push(n)
                    }), {
                        own: e,
                        "public": t
                    }
                })
            }

            function a(n, e, t) {
                t = t || {};
                var a = n.map(function(n) {
                    return n.location
                });
                e.fitBounds(a, {
                    maxZoom: t.maxZoom || 16,
                    animate: !0
                })
            }

            function o(n, e) {
                var t = n.user || {},
                    a = t.id;
                return e.createdBy === a
            }

            function i(n) {
                return n.put()
            }

            function r(n) {
                return n.remove()
            }

            function s(n, e) {
                return o(n, e)
            }

            function l(n, e, t) {
                t = t || {};
                var a = n.location;
                e.setView(a, t.zoom || 18, {
                    animate: !0
                })
            }

            function c(n) {
                var e = [];
                return n.floors.forEach(function(n) {
                    n.floorPlans.forEach(function(t) {
                        t.floorNumber = n.floorNumber, e.push(t)
                    })
                }), e
            }

            function d(e, t, a) {
                var o;
                return e.floors.forEach(function(n) {
                    return n.floorNumber === parseInt(t, 10) ? (o = n, void 0) : void 0
                }), o ? n.one("floors", o.id).get() : e.all("floors").post(a).then(function(n) {
                    return console.log(n), n.route = "floors", delete n.parentResource, n
                })
            }
            return {
                queryPublicVenues: e,
                queryMapVenues: t,
                centerMapToVenues: a,
                canEdit: o,
                isOwn: s,
                updateVenue: i,
                removeVenue: r,
                parseFloorplans: c,
                centerToVenue: l,
                searchLevelInVenue: d
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").factory("FloorplansHelper", ["api", "Leaflet", "affineHelper", function(n, e, t) {
            function a(n, e) {
                var t = n.user || {},
                    a = t.id;
                return t.isAdmin || e.createdBy === a
            }

            function o(n) {
                return n.put()
            }

            function i(n) {
                return n.remove()
            }

            function r(n, e) {
                return a(n, e)
            }

            function s(n) {
                return n.floor.venue.id
            }

            function l(n, e) {
                n.markers && n.markers.forEach(function(n) {
                    e.push({
                        lat: n.geo[0],
                        lng: n.geo[1],
                        x: n.floorplan[0],
                        y: n.floorplan[1]
                    })
                })
            }

            function c(n, e) {
                e = e || n.markers;
                var t = {
                    name: n.name,
                    description: n.description,
                    imageContent: n.image,
                    markers: e.map(function(n) {
                        return {
                            geo: [n.lat, n.lng],
                            floorplan: [n.x, n.y]
                        }
                    })
                };
                return t
            }

            function d(n, e, t) {
                this.floorplan = n, this.map = e, this.hide = t === !0
            }

            function u(n, e, t) {
                return new d(n, e, t)
            }
            var p = [1, 2, 3].map(function(n) {
                return new e.icon({
                    iconUrl: "/img/icon_marker_" + n + ".svg",
                    iconSize: [37, 47],
                    iconAnchor: [18.5, 44]
                })
            });
            return d.prototype._createMarkers = function() {
                return this.markerContainer ? this : (this.markerContainer = e.featureGroup(), this.floorplan.markers.forEach(function(n, t) {
                    this.markerContainer.addLayer(e.marker(n.geo, {
                        icon: p[t]
                    }))
                }, this), this)
            }, d.prototype.showImage = function() {
                return this.imageOverlay = new e.AffineOverlay(this.floorplan.url).addTo(this.map), this.map.on("viewreset", this.updateTransform.bind(this)), this.updateTransform(), this
            }, d.prototype.showMarkers = function() {
                return this._createMarkers(), this.markerContainer.addTo(this.map), this
            }, d.prototype.updateTransform = function() {
                var n = t.fit(this.floorplan.markers, this.map);
                this.imageOverlay.setTransform(n.matrix, n.origin)
            }, d.prototype.center = function() {
                this._createMarkers(); {
                    var n = this.markerContainer.getBounds();
                    this.floorplan.dimensions
                }
                return this.map.fitBounds(n, {
                    maxZoom: 22,
                    animate: !0
                }), this
            }, d.prototype.destroy = function() {
                this.imageOverlay && (this.map.removeLayer(this.imageOverlay), this.map.off("viewreset", this.updateTransform)), this.markerContainer && this.markerContainer.clearLayers()
            }, {
                getVenueId: s,
                canEdit: a,
                isOwn: r,
                updateFloorplan: o,
                removeFloorplan: i,
                formatFloorplanToOldDto: c,
                formatDtoToFloorplanner: l,
                createFloorplanView: u
            }
        }])
    }(),
    function() {
        "use strict";
        console.log("geocoder"), angular.module("idamaps.map").factory("geocoder", ["$http", "$log", "$q", "Leaflet", function(n, e, t, a) {
            function o(n) {
                var e = n.road || n.pedestrian || n.cycleway || "",
                    t = [];
                return e += n.house_number ? " " + n.house_number : "", e.length > 1 && t.push(e), e = n.postcode || "", e += " ", e += n.city || n.village || n.county || "", e.length > 2 && t.push(e), e = "", e += n.state || "", e.length > 1 && t.push(e), t.push(n.country), t
            }

            function i(a) {
                var i = t.defer();
                if (a = a || "", a = a.trim(), a.length < 2) return i.resolve([]), i.prmomise;
                var r = "//nominatim.openstreetmap.org/search",
                    s = {
                        q: a,
                        format: "json",
                        polygon: 0,
                        addressdetails: 1
                    };
                return n.get(r, {
                    params: s
                }).success(function(n) {
                    var e = n.map(function(n) {
                        var e = ["railway", "tunnel", "boundary", "highway"];
                        if (n.class && -1 !== e.indexOf(n.class)) return null;
                        var t = o(n.address);
                        return {
                            name: t[0],
                            address: t.slice(1).join(", "),
                            type: n.type,
                            importance: n.importance,
                            placeId: n.place_id,
                            lat: n.lat,
                            lng: n.lon
                        }
                    }).filter(function(n) {
                        return null !== n
                    });
                    i.resolve(e)
                }).error(function(n, t) {
                    e.error(JSON.stringify(n), t), i.reject(n, t)
                }), i.promise
            }

            function r(i) {
                var r = "//nominatim.openstreetmap.org/reverse",
                    s = t.defer(),
                    l = a.latLng(i).wrap(),
                    c = l.lat,
                    d = l.lng,
                    u = {
                        format: "json",
                        lat: c,
                        lon: d,
                        zoom: 18,
                        addressdetails: 1
                    };
                return n.get(r, {
                    params: u
                }).success(function(n) {
                    var e = o(n.address);
                    s.resolve({
                        name: e,
                        address: n.address
                    })
                }).error(function(n, t) {
                    e.error(JSON.stringify(n), t), s.reject()
                }), s.promise
            }
            return {
                search: i,
                reverse: r
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").factory("affineHelper", ["$window", function(n) {
            var e = n.mat3,
                t = n._;
            return {
                fit: function(a, o) {
                    var i = [].concat.apply([], [a.map(function(n) {
                            return n.floorplan[0]
                        }), a.map(function(n) {
                            return n.floorplan[1]
                        }), [1, 1, 1]]),
                        r = a.map(function(e) {
                            return o.latLngToLayerPoint(new n.L.latLng(e.geo[0], e.geo[1]))
                        }),
                        s = [].concat.apply([], [t.pluck(r, "x"), t.pluck(r, "y")]),
                        l = i,
                        c = s,
                        d = [];
                    e.invert(d, l);
                    var u = [],
                        p = {
                            x: 0,
                            y: 0
                        };
                    return e.mul(u, d, c), u = [u[0], u[3], u[1], u[4], u[2], u[5]], {
                        origin: p,
                        matrix: u
                    }
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("markerPosition", ["Leaflet", function(n) {
            function e(e, t, a, o) {
                var i = e.map,
                    r = 3,
                    s = [142, 272].map(function(n) {
                        return Math.floor(n / r)
                    }),
                    l = [71, 206].map(function(n) {
                        return Math.floor(n / r)
                    }),
                    c = [0, -188].map(function(n) {
                        return Math.floor(n / r)
                    }),
                    d = new n.icon({
                        iconUrl: "/img/icon_marker-move.svg",
                        iconSize: s,
                        iconAnchor: l,
                        popupAnchor: c
                    }),
                    u = n.marker(i.getCenter(), {
                        icon: d,
                        draggable: !0
                    }).addTo(i),
                    p = u.getLatLng();
                o.$setViewValue([p.lat, p.lng]), u.on("dragend", function() {
                    var n = u.getLatLng().wrap();
                    e.$apply(function() {
                        o.$setViewValue([n.lat, n.lng])
                    })
                }), o.$render = function() {
                    var n = o.$viewValue;
                    n && u.setLatLng(n)
                }, e.$on("$destroy", function() {
                    i.removeLayer(u)
                })
            }
            return {
                restrict: "A",
                require: "ngModel",
                link: e
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.map").directive("validatePosition", [function() {
            function n(n, e, t, a) {
                function o(n) {
                    if (!angular.isArray(n)) return !1;
                    var e = n[0],
                        t = n[1];
                    return e && angular.isNumber(e) ? t && angular.isNumber(t) ? !0 : !1 : !1
                }
                a.$parsers.unshift(function(n) {
                    var e = o(n);
                    return a.$setValidity("position", e), e ? n : void 0
                }), a.$formatters.unshift(function(n) {
                    return a.$setValidity("position", o(n)), n
                })
            }
            return {
                require: "ngModel",
                restrict: "A",
                link: n
            }
        }])
    }(),
    function() {
        "use strict";
        var n = "/components/application";
        angular.module("idamaps.application", []).config(["$stateProvider", function(e) {
            e.state("root.app", {
                url: "/applications",
                templateUrl: n + "/applications.html",
                controller: "ApplicationsCtrl",
                resolve: {
                    applications: ["account", "$state", function(n, e) {
                        return n.hasIdentity ? n.user.all("applications").getList() : (e.transitionTo("root.login"), void 0)
                    }]
                }
            }).state("root.app.new", {
                url: "/new",
                templateUrl: n + "/new.html",
                controller: "NewAppCtrl"
            }).state("root.app.app", {
                url: "/:appId",
                resolve: {
                    application: ["api", "$stateParams", "$state", "$log", function(n, e, t, a) {
                        return n.one("applications", e.appId).get().catch(function(n) {
                            a.error(n), t.transitionTo("root.app")
                        })
                    }],
                    apikeys: ["api", "$stateParams", "$state", "$log", function(n, e, t, a) {
                        return n.one("applications", e.appId).all("apikeys").getList().then(function(n) {
                            return n.map(function(n) {
                                return n.parentResource = null, n.route = "apikeys", n
                            })
                        }).catch(function(n) {
                            a.error(n), t.transitionTo("root.app")
                        })
                    }]
                },
                templateUrl: n + "/application.html",
                controller: "ApplicationCtrl"
            }).state("root.app.app.apikey", {
                url: "/apikey/:apikeyId",
                resolve: {
                    apikey: ["apikeys", "$stateParams", function(n, e) {
                        var t = n.filter(function(n) {
                            return n.id === e.apikeyId
                        });
                        return t[0]
                    }]
                },
                templateUrl: n + "/application-apikey.html",
                controller: "ApplicationApikeyCtrl"
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.application").controller("ApplicationCtrl", ["$scope", "account", "applications", "application", "apikeys", function(n, e, t, a, o) {
            function i(n, e) {
                return _.findIndex(e, function(e) {
                    return e.id === n.id
                })
            }
            e.hasIdentity && (n.canEdit = function() {
                return !0
            }, n.app = a, n.apikeys = o, n.newApiKey = function(e) {
                return e.all("apikeys").post().then(function(e) {
                    e.parentResource = null, e.route = "apikeys", n.apikeys.push(e)
                })
            }, n.deleteApp = function(e) {
                return console.log(e), e.remove().then(function() {
                    var t = i(e, n.apps);
                    t > -1 && n.apps.splice(t, 1), n.$state.go("root.app")
                })
            }, n.deleteApikey = function(e) {
                return e.remove().then(function() {
                    var t = i(e, n.apikeys);
                    t > -1 && n.apikeys.splice(t, 1), n.$state.go("root.app.app")
                })
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.application").controller("ApplicationApikeyCtrl", ["$scope", "apikey", function(n, e) {
            n.apikey = e
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.application").controller("ApplicationsCtrl", ["$scope", "account", "applications", function(n, e, t) {
            e.hasIdentity && (n.apps = t)
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.application").controller("NewAppCtrl", ["$scope", "account", "$state", function(n, e, t) {
            n.app = {}, n.submit = function() {
                var a = e.user;
                return a.all("applications").post(n.app).then(function(e) {
                    n.success = e, n.apps.push(e), t.go("^.app", {
                        appId: e.id
                    })
                }).catch(function(e) {
                    console.log(e), n.error = e
                })
            }, n.cancel = function() {
                n.$state.go("root.app.apps")
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.cancelpreventer", []).run(["$rootScope", "$modal", "$state", "cancelPreventer", function(n, e, t, a) {
            n.$on("$stateChangeStart", function(o, i, r) {
                return a.isEnabled() ? (o.preventDefault(), e.open({
                    templateUrl: "/components/cancelpreventer/cancelpreventer-modal.html"
                }).result.then(function() {
                    a.disable(), t.go(i, r)
                }).catch(function() {
                    n.loading.show = !1
                })) : void 0
            }), n.$on("$stateChangeSuccess", function(n, e) {
                var t = e.data || {};
                t.leaveProtection && a.enable()
            })
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.cancelpreventer").factory("cancelPreventer", [function() {
            function n() {
                a = !1
            }

            function e() {
                a = !0
            }

            function t() {
                return a === !0
            }
            var a = !1;
            return {
                disable: n,
                isEnabled: t,
                enable: e
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.cancelpreventer").directive("disableCancelPreventer", ["cancelPreventer", function(n) {
            return {
                link: function(e, t) {
                    t.on("click", function() {
                        e.$apply(function() {
                            n.disable()
                        })
                    })
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.filereader", [])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.filereader").factory("filereaderService", ["$log", function(n) {
            function e(e, a, o) {
                if (!e) return n.warn("no file"), o.$apply(function() {
                    a.$setTouched(), a.$setValidity("filetypeError", !1)
                }), void 0;
                if (!t.test(e.type)) return n.warn(e.type + "is not supported file format"), o.$apply(function() {
                    a.$setTouched(), a.$setValidity("filetypeError", !1)
                }), void 0;
                var i = new FileReader;
                i.onload = function(n) {
                    var e = n.target.result;
                    o.$apply(function() {
                        a.$setTouched(), a.$setValidity("filetypeError", !0), a.$setViewValue(e)
                    })
                }, i.onerror = function(n) {
                    throw new Error(n)
                }, i.readAsDataURL(e)
            }
            var t = /^(image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png)$/i;
            return {
                read: e
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.filereader").directive("filereader", ["$log", "filereaderService", function(n, e) {
            function t(n, t, a, o) {
                if (!o) throw new Error("No ng-model specified");
                o.$render = function() {}, t.bind("change", function() {
                    var a = t[0];
                    if (a.files) {
                        var i = a.files[0];
                        e.read(i, o, n)
                    }
                })
            }
            return {
                restrict: "A",
                require: "?ngModel",
                link: t
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.form", [])
    }(),
    function() {
        "use strict";
        var n = "/components/form";
        angular.module("idamaps.form").directive("formField", [function() {
            return {
                restrict: "A",
                transclude: !0,
                replace: !0,
                scope: {
                    field: "=formField"
                },
                templateUrl: n + "/formfield-directive.html"
            }
        }])
    }(),
    function() {
        "use strict";
        var n = "/components/form";
        angular.module("idamaps.form").directive("idaSubmit", ["$parse", function(e) {
            function t(n, t, a) {
                var o = e(n.submit);
                n.loading = !1, t.on("click", function(e) {
                    n.$apply(function() {
                        n.loading = !0, a.$set("disabled", !0), o(n, {
                            $event: e
                        }).finally(function() {
                            n.loading = !1, a.$set("disabled", !1)
                        })
                    })
                })
            }
            return {
                link: t,
                transclude: !0,
                templateUrl: n + "/idasubmit-directive.html",
                replace: !0,
                restrict: "A",
                scope: {
                    submit: "&idaSubmit"
                }
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.form").directive("formError", ["$filter", function(n) {
            function e(n) {
                n.$watch("formError", function(e) {
                    if (!e || "string" !== e && !e.toString) return n.error = !1, void 0;
                    var t = e.toString();
                    n.error = t
                })
            }
            n("formatError");
            return {
                link: e,
                template: '<div class="alert alert-danger" ng-show="error">{{error}}</div>',
                scope: {
                    formError: "="
                }
            }
        }]).service("formErrorHelper", [function() {
            function n(n, e) {
                if (null === n || null === e) throw new Error("form or response is null");
                e.formValidations().forEach(function(e) {
                    var t = n[e.property];
                    t && (t.$error.server = e.message, t.$invalid = !0)
                })
            }

            function e(n) {
                null !== n && Object.keys(n).forEach(function(e) {
                    try {
                        n[e].$error.server = !1, n[e].$invalid = !1
                    } catch (t) {}
                })
            }
            return {
                assignError: n,
                clearErrors: e
            }
        }])
    }(),
    function() {
        "use strict";
        angular.module("idamaps.form").directive("shouldMatch", function() {
            return {
                require: "ngModel",
                restrict: "A",
                scope: {
                    match: "="
                },
                link: function(n, e, t, a) {
                    n.$watch(function() {
                        var e = a.$modelValue || a.$$invalidModelValue;
                        return a.$pristine && angular.isUndefined(e) || n.match === e
                    }, function(n) {
                        a.$setValidity("match", n)
                    })
                }
            }
        })
    }();