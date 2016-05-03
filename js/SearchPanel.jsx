var React=require('react');
var ReactDom=require('react-dom');

var timeFlag=null;
var Searchpanel=React.createClass({
	getInitialState:function(){
		  return {
		  	placeholder:'搜地点、查电缆',
		  	planeDisplayed:false,
		  	bigInputValue: '北京',
		  	searchResult:false,//搜索结果组件显示影藏 fals影藏 true显示
		  	data:[],
		  	dataFangAn:[],
		  	dataTips:[]
		  }
	},
	// 搜索形式显示影藏
	onToggleForm:function(){
		this.setState({
			planeDisplayed: !this.state.planeDisplayed,
		});
	},
	// 大搜索input子组件传递value变化的值
	onChildChanged:function(newInputValue){
		this.state.bigInputValue=newInputValue;
	},
	// 大搜索ajax请求数据方法
	bigSearchAjax:function(){
		var self=this;
		var bigInputValue=this.state.bigInputValue;
		var database={
			optQueryName:bigInputValue
		}
		$.ajax({
			url:'http://127.0.0.1:8888/cable/jsp/system/opt/queryOptOnGIS.action',
			type: 'POST',
			dataType: 'json',
			data:database,
			beforeSend:function(){
				console.log("请求之前需要做的事情");
				self.setState({
	                searchResult:false,
	                searchResultInfo:false
	            });
			},
			success:function(data){
				self.setState({
	                data:data,
	                searchResult:true,
	                searchResultInfo:false
	            });
			},
			complete:function(){
				console.log("请求完成");
			},
			error:function(){
				console.log("参数错误");
			}
		});	
	},
	//方案数据展示，只请求一次
	SearchStarEndPanelFangAjax:function(){
		this.setState({
			planeDisplayed: !this.state.planeDisplayed,
		});
		var self=this;
		$.ajax({
			url:'http://127.0.0.1:8888/cable/planning/queryAllPlanningType.action',
			type: 'GET',
			dataType: 'json',
			beforeSend:function(){
				console.log("请求之前需要做的事情");
			},
			success:function(data){
				self.setState({
	                dataFangAn:data,
	            });
			},
			complete:function(){
				console.log("请求完成");
			},
			error:function(){
				console.log("参数错误");
			}
		});	
	},
	DataTips:function(newInputValue){
		var self=this;
		var newValue=$.trim(newInputValue);
		console.log(newValue);
		var database={
				nodeName:newValue,
				nodeType:'10'
			}
		$.ajax({
			url:'http://127.0.0.1:8888/cable/planning/querySeachPoint.action',
			type: 'POST',
			dataType: 'json',
			data:database,
			beforeSend:function(){
				console.log("请求之前需要做的事情");
			},
			success:function(data){
				self.setState({
	                dataTips:data,
	            });
				var searchWrap=self.refs.searchWrap;
				console.log(self.state.planeDisplayed);
				if(self.state.planeDisplayed){
					searchWrap.className="search_wrap";
				}else{
					searchWrap.className="search_wrap search_wrap_hover";
				}
			},
			complete:function(){
				console.log("请求完成");
			},
			error:function(){
				console.log("参数错误");
			}
		});	
	},
	render:function(){
		var styleObj={
			display: this.state.searchResult ? 'block': 'none',
		}
		return (
			<div>	
				<div className="search_panel">
					<div className="search_box">
						<div className="search_container">
							<SearchBigInput
								planeDisplayed={this.state.planeDisplayed}
								messages={this.state.placeholder}
								callbackParent={this.onChildChanged}
								SearchStarEndPanelFangAjax={this.SearchStarEndPanelFangAjax} 
								onToggleForm={this.onToggleForm} 
								DataTips={this.DataTips}/>
							<SearchStarEndPanel 
								onToggleForm={this.onToggleForm} 
			  					planeDisplayed={this.state.planeDisplayed}
			  					dataFangAn={this.state.dataFangAn} />
						</div>
						<SearchBigBtn 	
							bigSearchAjax={this.bigSearchAjax} />
						<SearchSmallBtn  />
					</div>
					<div id="search_result">
						<div style={ styleObj } className="search_res_box animated_down">
							<ul id="route_list" className="route">
								<SearchBigResult data={this.state.data} />
							</ul>
						</div>	
					</div>
				</div>
				<div ref="searchWrap" className="search_wrap"> 
					<div className="serach_scroll">
						<ul className="search_panel_bot">
							<TipsReult dataTips={this.state.dataTips} />
						</ul>
						<div className="clear_history" data-extra="clear">
								<a className="clear_link">删除历史</a></div>
					</div>
				</div>
				<div className="tooltip" id="tooltip_1">路线</div>
				<div className="tooltip" id="tooltip_2">搜索</div>
				<div className="tooltip" id="tooltip_3">关闭路线</div>
				<div className="drag"></div>
				<div className="tooltip" id="tooltip_4">拖动</div>
			</div>
			)
	}
});
// 下拉提示组件结构展示
var TipsReult=React.createClass({
	render:function(){
		var data=this.props.dataTips;
		console.log(data);
		if(!Array.isArray(data)) throw new Error('this.props.dataTips问题必须是数组');

		var dataTips = data.map(function(elem,index){
			return <TipsReultItems 
						key={index}
						seachPointType={elem.seachPointType}
						seachPointId={elem.seachPointId}
						seachPointName={elem.seachPointName} />
		}.bind(this));

		return (
			<div>
				{dataTips}
			</div>
			)
	}
});
// 下拉提示循环items
var TipsReultItems = React.createClass({
	render:function(){
		return (
			<li className="search_panel_bot_item">
				<a>
					<i className={"history history_"+this.props.seachPointType} data-pointid={this.props.seachPointId} data-pointtype={this.props.seachPointType}>{this.props.seachPointName}</i>
				</a>
			</li>
			)
	}

})
// 大搜索框搜索结果展示组件
var SearchBigResult=React.createClass({
	render:function(){
		var data=this.props.data;
		if(!Array.isArray(data)) throw new Error('this.props.data问题必须是数组');

		var dataComps = data.map(function(elem,index){
			return <SearchBigResultItems pid={elem.pid}
				index={index}
				showTitle={elem.showTitle}
				segmentNums={elem.segmentNums} 
				key={index} />
		}.bind(this) );

		return (
			<div>
				{dataComps}
			</div>	
			)
	}
});
// 大搜索框搜索结果循环item
var SearchBigResultItems=React.createClass({
	shouldComponentUpdate:function(nextProps,nextStates){
		return nextStates!=this.props.pid;
	},
	getInitialState:function(){
		  return {
		  	searchResultInfo:true,//搜索结果组件内部循环体显示影藏 fals影藏 true显示
		  	currentIndex:0
		  }
	},
	handlerClick:function(e){
		this.setState({
			searchResultInfo: !this.state.searchResultInfo,
		});
		var infodown=this.refs.infodown;
		if(this.state.searchResultInfo){
			infodown.className="info infodown";
		}else{
			infodown.className="info";
		}
	},
	render:function(){
		var self=this;
		return (
			<li className={"on_"+this.props.index}>
				<div id={"search_"+this.props.index} className="con">
					<div className="route_head" data-optid={this.props.pid} onClick={this.handlerClick}>
						<div className="schemeName">
							<font className=""></font>
							{this.props.showTitle}
							<span className="bus_type_tip"></span>
						</div>	
						<span className="bus_time">{this.props.segmentNums.length}条支线</span>
						<span className="busitemdelimiter">|</span>
						<span id={"blDis_"+this.props.index}></span>
						<span className="busitemdelimiter">|</span>
						<span></span>
					</div>
					<label className="button">
						<input data-optbtnid="{this.props.pid}" className="wqkgcheck" type="checkbox" />
						<span></span>
						<span></span>
						<span></span>
					</label>
					<div ref="infodown" className="info" id={"route_"+this.props.index}>
						<div id="wqtable">
							{
								this.props.segmentNums.map(function(val,i){
									return (
										<div>
											<div className="start-icon"></div>
											<table id={"trans_"+i} className="info-table" data-optid={self.props.pid} data-optsegid="" data-optname="" cellspacing="0" cellpadding="0">
												<tbody>
													{
														val.map(function(Wval,j){
															return (
																<tr className="" data-optid={self.props.pid} data-optsegid={Wval.optSegId}>
																	<th className="exchange-th"><div className="bysub"></div></th>
																	<td className="transferDetail">
																			<div className="getonstop">
																				<span>
																					<a className="ks"><font></font>{Wval.fromName}</a>
																				</span>
																			</div>
																			<span className="kl">
																				<span className="line-name">长度:{Wval.optSegOuterLength}km</span>
																				<span className="line-name">可用纤芯数:</span>
																				<span className="line-name wqkeyongqianxin">{Wval.fiberUnusedAmount}</span>
																				<span className="line-name wqtotleqianxin">总纤芯数:{Wval.fiberAmount}</span>&nbsp;</span>
																				<a className="cs tf"></a>
																		</td>
																</tr>
																)

														})
													}
												</tbody>
											</table>
											<div className="end-icon"></div>
										</div>
										)
								})
							}	
						</div>
					</div>	
				</div>
			</li>
			)
	}
});
// 大搜索框组件
var SearchBigInput=React.createClass({
	handlerChangeValue:function(e){
		var newInputValue=e.target.value;
		this.props.callbackParent(newInputValue);
	},
	handlerKeyUp:function(e){
		var self=this;
		var newInputValue=e.target.value;
		clearTimeout(timeFlag);
		timeFlag=setTimeout(function(){
			self.props.DataTips(newInputValue);
		}, 200);
	},
	render:function(){
		var styleObj={
			display: this.props.planeDisplayed ? 'none': 'block',
		}
		return (
			<div className="search_box_content" style={ styleObj }>
				<input ref="bigInput" id="sole-input" className="searchbox-content-common" type="text" name="word" autocomplete="off" maxlength="256" placeholder={this.props.messages} onChange={this.handlerKeyUp} onBlur={this.handlerChangeValue} />
				<SearchTabWay 
					SearchStarEndPanelFangAjax={this.props.SearchStarEndPanelFangAjax} />
			</div>
			)
	}
});
// 大搜索框按钮组件
var SearchBigBtn=React.createClass({
	render:function(){
		return (
			<button ref="BigBtn" onClick={this.props.bigSearchAjax} id="search_button" className="search_btn" data-title="搜索" data-tooltip="2"></button>
			)
	}
});
// 起始搜索框按钮组件
var SearchSmallBtn=React.createClass({
	render:function(){
		return (
			<button ref="SmallBtn" id="search_button1" className="search_btn" data-title="搜索" data-tooltip="2"></button>
			)
	}
});
// 起始搜索界面组件
var SearchStarEndPanel=React.createClass({
	render:function(){
		var styleObj={
			display: this.props.planeDisplayed ? 'block': 'none',
		}
		return (
			<div className="route_search_box fa1" style={ styleObj } data-index="1">
				<div className="route_header">
					<SearchStarEndPanelRoute dataFangAn={this.props.dataFangAn} />
					<SearchStarEndPanelCha onToggleForm={this.props.onToggleForm} />
				</div>
				<div className="route_box">
					<div className="route_box_comment">
						<div className="route_revert">
							<div className="route_revert_icon"></div>
						</div>
					</div>	
					<div className="route_inputs">
						<div className="route_start">
							<div className="route_start_icon"></div>
							<input autocomplete="off" maxlength="256" placeholder="输入起点" className="route_start_input" id="input_start" type="text" defaultValue="" data-pointid="" data-pointtype="" />
							<div className="route_clear route_start_clear" title="清空"></div>
						</div> 
						<div className="route_start route_end">
							<div className="route_start_icon route_end_icon"></div>
							<input autocomplete="off" maxlength="256" placeholder="输入终点" className="route_start_input" id="input_end" type="text" defaultValue="" data-pointid="" data-pointtype="" />
							<div className="route_clear route_end_clear" title="清空"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}
});
// 起始搜索界面差号组件
var SearchStarEndPanelCha=React.createClass({
	render:function(){
		return (
			<div className="route_search_btn" onClick={this.props.onToggleForm}  data-title="关闭" data-tooltip="3"></div>
			)
	}
});
// 起始搜索界面方案选择组件
var SearchStarEndPanelRoute=React.createClass({
	render:function(){
		var data=this.props.dataFangAn;
		// console.log(data);
		if(!Array.isArray(data)) throw new Error('this.props.data问题必须是数组');
		var dataComps = data.map(function(elem,index){
			return <SearchStarEndPanelRouteItems keys={elem.key}
				key={index}
				value={elem.value} />
		}.bind(this) );

		return (
			<div className="route_header_comment route-tabs">
                <div id="route_planning">
                	{dataComps}
                </div>
                <div className='arrow_wrap'></div>
			</div>
			)
	}
});
var SearchStarEndPanelRouteItems=React.createClass({
	handlerClick:function(){
	},
	render:function(){
		return (
			<div>
				<div ref='fangan' onClick={this.handlerClick} className={"tab_item fa"+this.props.key+"1_tab"} data-index={this.props.keys} data-className={this.props.keys}><i></i>
	        		<span>{this.props.value}</span>
	        	</div>
        	</div>
			)
	}
});
// 路线切换组件
var SearchTabWay=React.createClass({
	getInitialState:function(){
		return {
			BtnDispaly:true,
		}
	},
	handlerBtnDispaly:function(){
		this.setState({
			BtnDispaly: !this.state.BtnDispaly,
		});
		this.props.SearchStarEndPanelFangAjax();
	},
	render:function(){
		return (
			<div className="search_box_content_btn" data-title="分类查找" onClick={this.handlerBtnDispaly}></div>
			)
	}
});
ReactDom.render(<Searchpanel />,document.getElementById('wqSearch'),function(){
	console.log("渲染完成");
});