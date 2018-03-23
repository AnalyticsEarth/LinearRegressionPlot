define([
    './lrp-properties',
    './node_modules/picasso.js/dist/picasso.min',
    './node_modules/picasso-plugin-q/dist/picasso-q.min'
],
    function (properties, picasso, pq) {

        picasso.use(pq)
        //picasso.renderer.prio(["canvas"])

        return {
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 6, qHeight: 1666 }]
                },
                selections: 'CONFIRM'
            },
            definition: properties,
            template: '<div class="lrp" style="height:100%;position:relative;"></div>',
            paint: function ($element, layout) {
              //console.log(layout.qHyperCube);
              $element.empty();
              $element.html('<div class="lrp" style="height:100%;position:relative;"></div>');
              this.chart = picasso.chart({
                  element: $element.find('.lrp')[0],
                  settings: {
                    scales: {
                      sy: {
                        data: {
                          extract: {field: 'qDimensionInfo/2', trackBy: v => v.qElemNumber}
                        },
                        invert: true,
                        expand: 0.1,
						type: 'linear'
                      },
                      sx: {
                        data: {
                          extract: {field: 'qDimensionInfo/1', trackBy: v => v.qElemNumber}
                        },
						type: 'linear'
                      }
                    },
                    components: [
                      {
                        type: 'axis',
                        scale: 'sy',
                        dock: 'left'
                      },
                      {
                        type: 'text',
                        text: layout.qHyperCube.qDimensionInfo[2].qFallbackTitle,
						style: {
							text: {
								fontSize: '13px',
								fontFamily: '"QlikView Sans", sans-serif'
							}
						},
                        dock: 'left'
                      },
                      {
                        type: 'axis',
                        scale: 'sx',
                        dock: 'bottom'
                      },
                      {
                        type: 'text',
                        text: layout.qHyperCube.qDimensionInfo[1].qFallbackTitle,
						style: {
							text: {
								fontSize: '13px',
								fontFamily: '"QlikView Sans", sans-serif'
							}
						},
                        dock: 'bottom'
                      },
					  {
						key: 'lasso', // We'll use this reference when setting up our interaction events
						type: 'brush-lasso',
						settings: {
							brush: { // Note how the brush property is defined inside the settings objects. This is because for brush in this case is a component specific setting.
								components: [
									{
										key: 'datapoint', // We want to brush shapes from the point component
										contexts: ['lasso-example']
									}
								]
							}
						}
					  },
                      {
                        key:'datapoint',
                        type: 'point',
                        displayOrder: 3,
                        data: {
                          extract: {
                            field: 'qDimensionInfo/0',
							trackBy: v => v.qElemNumber,
                            props: {
                              sx: { field: 'qDimensionInfo/1', value: v => v.qNum },
                              sy: { field: 'qDimensionInfo/2', value: v => v.qNum }
                            }
                          }
                        },
                        settings: {
                          x: { scale: 'sx', ref: 'sx' },
                          y: { scale: 'sy', ref: 'sy' },
                          fill: '#29335C',
                          size: 0.05,
                          opacity: 0.5
                        },
						brush: {
                            consume: [{
								context: 'lasso-example', // We'll later use this reference in the lasso-brush defintion
								style: {
									inactive: {
										opacity: 0.3
									}
								}
							}]
                        }
                      },
                      {
                        key: 'ciband',
                        type: 'line',
                        displayOrder: 1,
                        data: {
                          extract: {
                            field: 'qDimensionInfo/0',
							trackBy: v => v.qElemNumber,
                            props: {
                              sx: { field: 'qDimensionInfo/1', value: v => v.qNum },
                              syl: { field: 'qMeasureInfo/1' },
                              syh: { field: 'qMeasureInfo/2' }
                            }
                          }
                        },
                        settings: {
                          coordinates: {
                            major: { scale: 'sx', ref: 'sx' },
                            minor0: { scale: 'sy', ref: 'syl' },
                            minor: { scale: 'sy', ref: 'syh' }
                          },
                          layers: {
                            curve: 'linear',
                            line: {
                              show: true,
                              stroke:'#EDB230',
                              strokeWidth:2
                            },
                            area: {
                              fill: '#FFD151'
                            }
                          }
                        }
                      },
                      {
                        key: 'predict',
                        type: 'line',
                        displayOrder: 2,
                        data: {
                          extract: {
                            field: 'qDimensionInfo/0',
							trackBy: v => v.qElemNumber,
                            props: {
                              sx: { field: 'qDimensionInfo/1', value: v => v.qNum },
                              sy: { field: 'qMeasureInfo/0' }
                            }
                          }
                        },
                        settings: {
                          coordinates: {
                            major: { scale: 'sx', ref: 'sx' },
                            minor: { scale: 'sy', ref: 'sy' }
                          },
                          layers: {
                            curve: 'linear',
                            line: {
                              strokeWidth: 3,
                              stroke:'#E4572E'
                            },
                            area: {
                              show:false
                            }
                          }
                        }
                      }
                    ],
					interactions: [
  {
    type: 'native',
    events: {
      mousedown: function(e) {
        // Use Alt-key + click to reset the brush
        if (e.altKey) {
        	this.chart.brush('lasso-example').end();
        }

        // Fetch the lasso component instance and trigger the lassoStart event
        this.chart.component('lasso').emit('lassoStart', { center: { x: e.clientX, y: e.clientY } });
      },
      mousemove: function(e) {
        this.chart.component('lasso').emit('lassoMove', { center: { x: e.clientX, y: e.clientY } });
      },
      mouseup: function(e) {
        this.chart.component('lasso').emit('lassoEnd', { center: { x: e.clientX, y: e.clientY } });
      }
    }
  }
]
				  }
              })

              this.chartBrush = this.chart.brush('lasso-example');

				this.chartBrush.on('end', () => {
					//console.log("Finished");
				});

				this.chartBrush.on('update', (added, removed) => {
					//console.log(this.chartBrush);
					//console.log(added);
					//console.log(removed);
					//console.log(this.chartBrush.isActive());
				  const selections = [].concat(added, removed).map(v => v.values);
				  //console.log(selections);
                  this.selectValues(0, selections, false);
				  //this.chartBrush.end();
				});

				if (this.chartBrush.isActive) this.chartBrush.end();
                  //resolve(layout);


              return new Promise((resolve, reject) => {

				this.chart.update({
                      data: [{
                          type: 'q',
                          key: 'qHyperCube',
                          data: layout.qHyperCube
                      }]
                  });



              })
            }
        }
    })
