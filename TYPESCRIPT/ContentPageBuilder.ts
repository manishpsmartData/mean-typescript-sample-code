import globalPackage = window.globalPackage;
import CpPageService = cpPageComponent.cpPageService;
/**
 * Created by Manish Podiyal 
 * It's just a sample code of using typescript oops concept to manage a big scalable javascript client end module.
 */
(function () {
	'use strict';

	/**
	*
	*/
	class ContentPageBuilder {
		chapterId : number;
		pageId : number;
		title : string;
		author : string;
		__config : PageConfigObj = {
			SyncObject : {
				CommonParams : {
					IsGrid : false,
					IsSnap : false,
					ViewportDesktop : true,
					ViewportTablet : false,
					ViewportMobile : false,
					Background : {
						Type : "",
						Data : "",
						LqData : "",
						BgOpacity : "1"
					}
				},
				ViewportDesktopSections : {
					Widgets : []
				},
				ViewportTabletSections : {
					Widgets : []
				},
				ViewportMobileSections : {
					Widgets : []
				}  
			},
			currentViewport : "desktop",         //desktop-1024X640/tablet-768X640/mobile-320X528
			workshop : "",
			showroom : ""
		};
		
		/*
		* @param : chapterId
		* @param : pageId
		* @param : pageName
		* @param : author
		*/
		constructor(public chapterId , public pageId , public pageName , public author) {
			this.chapterId = chapterId;
			this.pageId = pageId;
			this.title = pageName;
			this.author = author;
			this.getChapterData(this.chapterId);
		}
		/*
		* @param : chapterId
		*/
		getChapterData(chapterId : number) : void {   //need allPages for navigation purpose
			CpPageService.getChapterData(chapterId).success(function(data){
				console.log(data)
				if ( data.status == 200 ) {
					this.allPages = data.results ;
					this.openPage();
				}
				else{
					globalPackage.setFlashInstant('Opps!! Something went wrong' , 'success');
				}
			})
		}
		/*
		* @param : syncObject
		*/
		syncData : function (syncObject : String) : void {   //need allPages for navigation purpose
			CpPageService.syncData(syncObject).success(function(data){
				//console.log(data) - further logic...
				
			})
		}
		/*
		* any
		*/
		getMyAddress : function() : number {
			return pageId;
		}
	}

	interface PageConfigObj : {
		//define
	}

	interface ContentPageBuilder {
		chapterId : number;
		pageId : number;
		pageName : string;
		author : string;
	}

	function greeter(contentPageBuilder : ContentPageBuilder) {
		return "Welcome, the current page id is " + contentPageBuilder.getMyAddress() +" and title is " + contentPageBuilder.pageName + "created by "+contentPageBuilder.author+ ". Please scoll down to check different widgets with interactive animation effects";
	}

	//loop through the whole chapter and get an instance for each of the page under it.
	var contentPage1 = new ContentPageBuilder(221 , 3 , "Introduction" , "Manish Podiyal");
	//document.body.innerHTML = greeter(contentPage1);
}())