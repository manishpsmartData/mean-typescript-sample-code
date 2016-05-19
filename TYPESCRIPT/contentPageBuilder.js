var globalPackage = window.globalPackage;
/**
 * Created by Manish Podiyal
 */
(function () {
    'use strict';
    /**
    *
    */
    var ContentPageBuilder = (function () {
        /*
        * @param : chapterId
        * @param : pageId
        * @param : pageName
        * @param : author
        */
        function ContentPageBuilder(chapterId, pageId, pageName, author) {
            this.chapterId = chapterId;
            this.pageId = pageId;
            this.pageName = pageName;
            this.author = author;
            this.__config = {
                SyncObject: {
                    CommonParams: {
                        IsGrid: false,
                        IsSnap: false,
                        ViewportDesktop: true,
                        ViewportTablet: false,
                        ViewportMobile: false,
                        Background: {
                            Type: "",
                            Data: "",
                            LqData: "",
                            BgOpacity: "1"
                        }
                    },
                    ViewportDesktopSections: {
                        Widgets: []
                    },
                    ViewportTabletSections: {
                        Widgets: []
                    },
                    ViewportMobileSections: {
                        Widgets: []
                    }
                },
                currentViewport: "desktop",
                workshop: "",
                showroom: ""
            };
            /*
            * @param : syncObject
            */
            this.syncData = function (syncObject) {
                CpPageService.syncData(syncObject).success(function (data) {
                    //console.log(data) - further logic...
                });
            };
            /*
            * any
            */
            this.getMyAddress = function () {
                return pageId;
            };
            this.chapterId = chapterId;
            this.pageId = pageId;
            this.title = pageName;
            this.author = author;
            this.getChapterData(this.chapterId);
        }
        /*
        * @param : chapterId
        */
        ContentPageBuilder.prototype.getChapterData = function (chapterId) {
            CpPageService.getChapterData(chapterId).success(function (data) {
                console.log(data);
                if (data.status == 200) {
                    this.allPages = data.results;
                    this.openPage();
                }
                else {
                    globalPackage.setFlashInstant('Opps!! Something went wrong', 'success');
                }
            });
        };
        return ContentPageBuilder;
    }());
    {
    }
    function greeter(contentPageBuilder) {
        return "Welcome, the current page id is " + contentPageBuilder.getMyAddress() + " and title is " + contentPageBuilder.pageName + "created by " + contentPageBuilder.author + ". Please scoll down to check different widgets with interactive animation effects";
    }
    //loop through the whole chapter and get an instance for each of the page under it.
    var contentPage1 = new ContentPageBuilder(221, 3, "Introduction", "Manish Podiyal");
    //document.body.innerHTML = greeter(contentPage1);
}());
