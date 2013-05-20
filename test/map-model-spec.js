/*global _, observable, beforeEach, describe, expect, it, jasmine, spyOn, MAPJS*/
describe('MapModel', function () {
	'use strict';
	it('should be able to instantiate MapModel', function () {
		var layoutCalculator,
			underTest = new MAPJS.MapModel(observable({}), layoutCalculator);
		expect(underTest).not.toBeUndefined();
	});
	it('should dispatch inputEnabledChanged event when input is disabled', function () {
		var underTest = new MAPJS.MapModel(observable({})),
			inputEnabledChangedListener = jasmine.createSpy();
		underTest.addEventListener('inputEnabledChanged', inputEnabledChangedListener);

		underTest.setInputEnabled(false);

		expect(inputEnabledChangedListener).toHaveBeenCalledWith(false);
	});
	it('should dispatch inputEnabledChanged event when input is re-enabled', function () {
		var underTest = new MAPJS.MapModel(observable({})),
			inputEnabledChangedListener = jasmine.createSpy();
		underTest.setInputEnabled(false);
		underTest.addEventListener('inputEnabledChanged', inputEnabledChangedListener);
		underTest.setInputEnabled(true);
		expect(inputEnabledChangedListener).toHaveBeenCalledWith(true);
	});
	describe('events dispatched by MapModel when idea/layout is changed', function () {
		var underTest,
			anIdea,
			layoutBefore,
			layoutAfter;
		beforeEach(function () {
			var layoutCalculatorLayout,
				layoutCalculator = function () {
					return layoutCalculatorLayout;
				};
			layoutBefore = {
				nodes: {
					1: {
						x: 10,
						y: 20,
						title: 'This node will be removed'
					},
					2: {
						x: 50,
						y: 20,
						title: 'second'
					},
					9: {
						x: 100,
						y: 100,
						title: 'style change',
						attr: {style: {prop: 'old val'}}
					}
				}
			};
			layoutAfter = {
				nodes: {
					2: {
						x: 49,
						y: 20,
						title: 'This node will be moved'
					},
					3: {
						x: 100,
						y: 200,
						title: 'This node will be created',
						attr: {
							attachment: 'hello'
						}
					},
					9: {
						x: 100,
						y: 100,
						title: 'style change',
						attr: {style: {prop: 'new val'}}
					}
				}
			};
			underTest = new MAPJS.MapModel(observable({}), layoutCalculator, ['this will have all text selected'], ['this will too']);
			layoutCalculatorLayout = layoutBefore;
			anIdea = MAPJS.content({
				id: 4,
				title: 'this will have all text selected',
				ideas: {
					100: {
						id: 5,
						title: 'this will too'
					},
					101: {
						id: 6,
						title: 'this will have all text selected'
					}
				}
			});
			underTest.setIdea(anIdea);
			layoutCalculatorLayout = layoutAfter;
		});
		it('should dispatch nodeCreated event when a node is created because idea is changed', function () {
			var nodeCreatedListener = jasmine.createSpy();
			underTest.addEventListener('nodeCreated', nodeCreatedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeCreatedListener).toHaveBeenCalledWith(layoutAfter.nodes[3]);
		});
		it('should dispatch nodeMoved event when a node is moved because idea is changed', function () {
			var nodeMovedListener = jasmine.createSpy();
			underTest.addEventListener('nodeMoved', nodeMovedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeMovedListener).toHaveBeenCalledWith(layoutAfter.nodes[2]);
		});
		it('should dispatch nodeRemoved event when a node is removed because idea is changed', function () {
			var nodeRemovedListener = jasmine.createSpy();
			underTest.addEventListener('nodeRemoved', nodeRemovedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeRemovedListener).toHaveBeenCalledWith(layoutBefore.nodes[1]);
		});
		describe('openAttachment', function () {
			it('should dispatch attachmentOpened event when openAttachment is invoked', function () {
				var attachmentOpenedListener = jasmine.createSpy();
				underTest.addEventListener('attachmentOpened', attachmentOpenedListener);
				anIdea.dispatchEvent('changed');

				underTest.openAttachment('source', 3);

				expect(attachmentOpenedListener).toHaveBeenCalledWith(3, 'hello');
			});
			it('should use currently selected node if no node id specified', function () {
				var attachmentOpenedListener = jasmine.createSpy();
				underTest.addEventListener('attachmentOpened', attachmentOpenedListener);
				underTest.selectNode(3);
				anIdea.dispatchEvent('changed');

				underTest.openAttachment('source');

				expect(attachmentOpenedListener).toHaveBeenCalledWith(3, 'hello');
			});
		});
		describe('editNode', function () {
			it('should dispatch nodeEditRequested when a request to edit node is made', function () {
				var nodeEditRequestedListener = jasmine.createSpy();
				underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
				underTest.selectNode(1);

				underTest.editNode('toolbar', true);

				expect(nodeEditRequestedListener).toHaveBeenCalledWith(1, true, false);
			});
			it('should not dispatch nodeEditRequested when input is disabled', function () {
				var nodeEditRequestedListener = jasmine.createSpy();
				underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
				underTest.selectNode(1);
				underTest.setInputEnabled(false);
				underTest.editNode('toolbar', true);
				expect(nodeEditRequestedListener).not.toHaveBeenCalled();
			});
			it('should select all text when the current text of root node is one of our defaults', function () {
				var nodeEditRequestedListener = jasmine.createSpy();
				underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
				underTest.selectNode(4);

				underTest.editNode('toolbar', false);

				expect(nodeEditRequestedListener).toHaveBeenCalledWith(4, true, false);
			});
			it('should select all text when the current text of child node is one of our defaults', function () {
				var nodeEditRequestedListener = jasmine.createSpy();
				underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
				underTest.selectNode(6);

				underTest.editNode('toolbar', false);

				expect(nodeEditRequestedListener).toHaveBeenCalledWith(6, true, false);
			});
			it('should select all text when the current text of child node is one of our intermediate defaults', function () {
				var nodeEditRequestedListener = jasmine.createSpy();
				underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
				underTest.selectNode(5);

				underTest.editNode('toolbar', false);

				expect(nodeEditRequestedListener).toHaveBeenCalledWith(5, true, false);
			});
		});
		it('should dispatch nodeAttrChanged the style changes is created', function () {
			var nodeAttrChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeAttrChanged', nodeAttrChangedListener);
			anIdea.dispatchEvent('changed');
			expect(nodeAttrChangedListener).toHaveBeenCalledWith(layoutAfter.nodes[9]);
		});
		describe("focus/edit automatic control", function () {

			var nodeEditRequestedListener,
				nodeMovedListener,
				insertIntermediate = function (contentSession, commandSession) {
					anIdea = MAPJS.content({
						id: 1,
						ideas: {
							7: {
								id: 2
							}
						}
					}, contentSession);
					underTest.setIdea(anIdea);
					underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
					anIdea.execCommand('insertIntermediate', [2, 'ttl', 3], commandSession);
				},
				addSubIdea = function (originalSession, commandSession) {
					anIdea = MAPJS.content({
						id: 1,
						ideas: {
							7: {
								id: 2
							}
						}
					}, originalSession);
					underTest.setIdea(anIdea);
					underTest.addEventListener('nodeEditRequested', nodeEditRequestedListener);
					anIdea.execCommand('addSubIdea', [2, 'ttt', 3], commandSession);
				},
				updateAttrs = function (originalSession, commandSession) {
					var layoutCalculatorLayout,
						layoutCalculator = function () {
							return layoutCalculatorLayout;
						},
						underTest,
						anIdea,
						layoutBefore,
						layoutAfter;

					layoutBefore = {
						nodes: {
							1: {
								x: 100,
								y: 200,
								title: 'First'
							},
							2: {
								x: 0,
								y: 0,
								title: 'Second'
							}
						}
					};
					layoutAfter = {
						nodes: {
							1: {
								x: 110,
								y: 220,
								title: 'First'
							},
							2: {
								x: 0,
								y: 0,
								title: 'Second'
							}
						}
					};
					layoutCalculatorLayout = layoutBefore;
					anIdea = MAPJS.content({title: 'ttt'}, originalSession);
					underTest = new MAPJS.MapModel(observable({}), layoutCalculator);
					underTest.setIdea(anIdea);
					layoutCalculatorLayout = layoutAfter;
					underTest.addEventListener('nodeMoved', nodeMovedListener);

					anIdea.dispatchEvent('changed', 'updateAttr', [1], commandSession);
				};
			beforeEach(function () {
				nodeMovedListener = jasmine.createSpy();
				nodeEditRequestedListener = jasmine.createSpy();
			});
			describe("when no session is defined", function () {
				it('should dispatch edit when intermediate is created', function () {
					insertIntermediate();
					expect(nodeEditRequestedListener).toHaveBeenCalledWith(3, true, true);
				});
				it('should dispatch edit when a new idea is added', function () {
					addSubIdea();
					expect(nodeEditRequestedListener).toHaveBeenCalledWith(3, true, true);
				});
				it('should move map to keep the currently selected node in the same place while updating style (expand/collapse)', function () {
					updateAttrs();
					expect(nodeMovedListener.callCount).toBe(1);
					expect(nodeMovedListener).toHaveBeenCalledWith({
						x: -10,
						y: -20,
						title: 'Second'
					});
				});
			});
			describe("when session is defined and matches local session", function () {
				it('should dispatch edit when intermediate is created', function () {
					insertIntermediate('originSession', 'originSession');
					expect(nodeEditRequestedListener).toHaveBeenCalledWith(3, true, true);
				});
				it('should dispatch edit when a new idea is added', function () {
					addSubIdea('originSession', 'originSession');
					expect(nodeEditRequestedListener).toHaveBeenCalledWith(3, true, true);
				});
				it('should move map to keep the currently selected node in the same place while updating style (expand/collapse)', function () {
					updateAttrs('originSession', 'originSession');
					expect(nodeMovedListener.callCount).toBe(1);
					expect(nodeMovedListener).toHaveBeenCalledWith({
						x: -10,
						y: -20,
						title: 'Second'
					});
				});
			});
			describe("when session is defined but command session does not match local session", function () {
				it('should not dispatch edit when intermediate is created', function () {
					insertIntermediate('originSession', 'differentSession');
					expect(nodeEditRequestedListener).not.toHaveBeenCalled();
				});
				it('should not dispatch edit when a new idea is added', function () {
					addSubIdea('originSession', 'differentSession');
					expect(nodeEditRequestedListener).not.toHaveBeenCalled();
				});
				it('should not compensate movements of the context node', function () {
					updateAttrs('originSession', 'otherSession');
					expect(nodeMovedListener).toHaveBeenCalledWith({
						x: 110,
						y: 220,
						title: 'First'
					});
				});
			});
		});
	});
	describe('methods delegating to idea', function () {
		var anIdea, underTest;
		beforeEach(function () {
			anIdea = MAPJS.content({
				id: 1,
				title: 'root',
				ideas: {
					10: {
						id: 2,
						title: 'child'
					}
				}
			});
			underTest = new MAPJS.MapModel(observable({}), function () {
				return {
					nodes: {2: {attr: {style: {styleprop: 'oldValue'}}}}
				};
			});
			underTest.setIdea(anIdea);
		});
		describe('updateTitle', function () {
			beforeEach(function () {
				spyOn(anIdea, 'updateTitle');
				underTest.selectNode(123);
			});
			it('should invoke idea.updateTitle with the arguments', function () {
				underTest.updateTitle(123, 'abc');
				expect(anIdea.updateTitle).toHaveBeenCalledWith(123, 'abc');
			});
			it('should work even if input is enabled', function () {
				underTest.setInputEnabled(false);
				underTest.updateTitle(123, 'abc');
				expect(anIdea.updateTitle).toHaveBeenCalledWith(123, 'abc');
			});
		});
		describe('addSubIdea', function () {
			beforeEach(function () {
				spyOn(anIdea, 'addSubIdea');
				underTest.selectNode(123);
			});
			it('should invoke idea.addSubIdea with currently selected idea as parentId', function () {
				underTest.addSubIdea();
				expect(anIdea.addSubIdea).toHaveBeenCalledWith(123, 'double click to edit');
			});
			it('should invoke idea.addSubIdea with argument idea as parentId if provided', function () {
				underTest.addSubIdea('source', 555);
				expect(anIdea.addSubIdea).toHaveBeenCalledWith(555, 'double click to edit');
			});
			it('should not invoke idea.addSubIdea when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.addSubIdea();
				expect(anIdea.addSubIdea).not.toHaveBeenCalled();
			});
			it('should expand the node when addSubIdea is called', function () {
				underTest.selectNode(1);
				underTest.collapse('source', true);
				spyOn(anIdea, 'updateAttr');
				underTest.addSubIdea();
				expect(anIdea.updateAttr).toHaveBeenCalledWith(1, 'collapsed', false);
			});
			it('should invoke idea.addSubIdea with randomly selected title when addSubIdea method is invoked', function () {
				var underTest = new MAPJS.MapModel(
					observable({}),
					function () {
						return {};
					},
					['What', 'a', 'beautiful', 'idea!'] //.split(' ')
				);
				underTest.setIdea(anIdea);
				spyOn(Math, 'random').andReturn(0.6);

				underTest.addSubIdea();

				expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'beautiful');
			});
		});
		describe('copy', function () {
			beforeEach(function () {
				spyOn(anIdea, 'clone').andReturn('CLONE');
				underTest.selectNode(11);
			});
			it('should clone active idea into clipboard when copy is called', function () {
				underTest.copy('keyboard');
				expect(anIdea.clone).toHaveBeenCalledWith(11);
			});
			it('should not clone if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.copy('keyboard');
				expect(anIdea.clone).not.toHaveBeenCalled();
			});
		});
		describe('paste', function () {
			var toPaste;
			beforeEach(function () {
				toPaste = {title: 'clone'};
				spyOn(anIdea, 'clone').andReturn(toPaste);
				spyOn(anIdea, 'paste');
				underTest.selectNode(11);
				underTest.copy('keyboard');
				underTest.selectNode(12);
			});
			it('should paste clipboard into currently selected idea', function () {
				underTest.paste('keyboard');
				expect(anIdea.paste).toHaveBeenCalledWith(12, toPaste);
			});
			it('should not paste when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.paste('keyboard');
				expect(anIdea.paste).not.toHaveBeenCalled();
			});
		});
		describe('pasteStyle', function () {
			var toPaste;
			beforeEach(function () {
				toPaste = {title: 'c', attr: {style: {color: 'red'}}};
				spyOn(anIdea, 'clone').andReturn(toPaste);
				spyOn(anIdea, 'updateAttr');
				underTest.selectNode(11);
				underTest.copy('keyboard');
				underTest.selectNode(2);
			});
			it('should set root node style from clipboard to currently selected idea', function () {
				underTest.pasteStyle('keyboard');
				expect(anIdea.updateAttr).toHaveBeenCalledWith(2, 'style', toPaste.attr.style);
			});
			it('should not paste when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.pasteStyle('keyboard');
				expect(anIdea.updateAttr).not.toHaveBeenCalled();
			});
		});
		describe('cut', function () {
			var toPaste;
			beforeEach(function () {
				toPaste = {title: 'clone'};
				spyOn(anIdea, 'clone').andReturn(toPaste);
				spyOn(anIdea, 'paste');
				spyOn(anIdea, 'removeSubIdea');
				underTest.selectNode(11);
			});
			it('should invoke idea.removeSubIdea when cut/paste method is invoked', function () {
				underTest.cut('keyboard');
				expect(anIdea.removeSubIdea).toHaveBeenCalledWith(11);
			});
			it('should not invoke idea.removeSubIdea when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.cut('keyboard');
				expect(anIdea.removeSubIdea).not.toHaveBeenCalled();
			});
			it('should paste cut content when cut/paste sequence executes', function () {
				underTest.cut('keyboard');
				underTest.selectNode(12);
				underTest.paste('keyboard');
				expect(anIdea.paste).toHaveBeenCalledWith(12, toPaste);
				expect(anIdea.removeSubIdea).toHaveBeenCalledWith(11);
			});
		});
		describe('undo', function () {
			beforeEach(function () {
				underTest.selectNode(123);
				spyOn(anIdea, 'undo');
			});
			it('should invoke idea.undo', function () {
				underTest.undo();
				expect(anIdea.undo).toHaveBeenCalled();
			});
			it('should not invoke idea.undo input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.undo();
				expect(anIdea.undo).not.toHaveBeenCalled();
			});
		});
		describe('moveRelative', function () {
			beforeEach(function () {
				underTest.selectNode(123);
				spyOn(anIdea, 'moveRelative');
			});
			it('should invoke idea.moveRelative passing the argument', function () {
				underTest.moveRelative('keyboard', -1);
				expect(anIdea.moveRelative).toHaveBeenCalledWith(123, -1);
			});
			it('should not invoke idea.moveRelative when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.moveRelative('keyboard', -1);
				expect(anIdea.moveRelative).not.toHaveBeenCalled();
			});
		});
		describe('redo', function () {
			beforeEach(function () {
				underTest.selectNode(123);
				spyOn(anIdea, 'redo');
			});
			it('should invoke idea.redo', function () {
				underTest.redo();
				expect(anIdea.redo).toHaveBeenCalled();
			});
			it('should not invoke idea.redo when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.redo();
				expect(anIdea.redo).not.toHaveBeenCalled();
			});
		});
		describe('removeSubIdea', function () {
			beforeEach(function () {
				spyOn(anIdea, 'removeSubIdea');
				underTest.selectNode(321);
			});
			it('should invoke idea.removeSubIdea with currently selected idea', function () {
				underTest.removeSubIdea('toolbar');
				expect(anIdea.removeSubIdea).toHaveBeenCalledWith(321);
			});
			it('should invoke idea.removeSubIdea with argument idea if given', function () {
				underTest.removeSubIdea('toolbar', 9999);
				expect(anIdea.removeSubIdea).toHaveBeenCalledWith(9999);
			});
			it('should not invoke idea.removeSubIdea when input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.removeSubIdea('toolbar');
				expect(anIdea.removeSubIdea).not.toHaveBeenCalled();
			});
		});
		describe('colapse', function () {
			beforeEach(function () {
				spyOn(anIdea, 'updateAttr');
			});
			it('should update selected node style to collapsed when argument is true', function () {
				underTest.collapse('source', true);
				expect(anIdea.updateAttr).toHaveBeenCalledWith(1, 'collapsed', true);
			});
			it('should expand selected node when argument is false', function () {
				underTest.collapse('source', false);
				expect(anIdea.updateAttr).toHaveBeenCalledWith(1, 'collapsed', false);
			});
			it('should not update styles if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.collapse('source', false);
				expect(anIdea.updateAttr).not.toHaveBeenCalled();
			});
			it('should not update style on leaf nodes', function () {
				underTest.selectNode(2);
				underTest.collapse('source', true);
				expect(anIdea.updateAttr).not.toHaveBeenCalled();
			});
		});
		describe('addSiblingIdea', function () {
			beforeEach(function () {
				spyOn(anIdea, 'addSubIdea');
			});
			it('should invoke idea.addSubIdea with a parent of a currently selected node', function () {
				underTest.selectNode(2);
				underTest.addSiblingIdea();
				expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'double click to edit');
			});
			it('should invoke idea.addSubIdea with a root node if root is currently selected (root has no parent or siblings)', function () {
				underTest.addSiblingIdea();
				expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'double click to edit');
			});
			it('should expand the root node if it is collapsed', function () {
				underTest.collapse('source', true);
				spyOn(anIdea, 'updateAttr');
				underTest.addSiblingIdea();
				expect(anIdea.updateAttr).toHaveBeenCalledWith(1, 'collapsed', false);
			});
			it('should not invoke anything if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.addSiblingIdea();
				expect(anIdea.addSubIdea).not.toHaveBeenCalled();
			});
		});
		describe('updateStyle', function () {
			beforeEach(function () {
				spyOn(anIdea, 'updateAttr');
				underTest.selectNode(2);
			});
			it('should invoke idea.setAttr with selected ideaId and style argument when updateStyle is called', function () {
				underTest.updateStyle('source', 'styleprop', 'styleval');
				expect(anIdea.updateAttr).toHaveBeenCalledWith(2, 'style', { styleprop: 'styleval' });
			});
			it('should not invoke idea.setAttr if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.updateStyle('source', 'styleprop', 'styleval');
				expect(anIdea.updateAttr).not.toHaveBeenCalled();
			});
			it('should not invoke idea.setAttr with selected ideaId and style argument when updateStyle is called with same value', function () {
				underTest.updateStyle('source', 'styleprop', 'oldValue');
				expect(anIdea.updateAttr).not.toHaveBeenCalled();
			});
			it('should merge argument with previous style', function () {
				anIdea.findSubIdeaById(2).attr = { style : {'color': 'black'}};
				underTest.updateStyle('source', 'noncolor', 'nonblack');
				expect(anIdea.updateAttr).toHaveBeenCalledWith(2, 'style', {color: 'black', noncolor: 'nonblack'});
			});
		});
		describe('setAttachment', function () {
			var attachment;
			beforeEach(function () {
				spyOn(anIdea, 'updateAttr');
				underTest.selectNode(2);
				attachment = { contentType: 'text/html', content: 'Hello' };
			});
			it('should invoke idea.setAttr with specified ideaId and attachment argument when setAttachment is called', function () {
				underTest.setAttachment('source', 2, attachment);

				expect(anIdea.updateAttr).toHaveBeenCalledWith(2, 'attachment', attachment);
			});
			it('should remove attachment if no content', function () {
				underTest.setAttachment(
					'source',
					2, {
						contentType: 'text/html',
						content: ''
					}
				);

				expect(anIdea.updateAttr).toHaveBeenCalledWith(2, 'attachment', false);
			});
		});
		describe('insertIntermediate', function () {
			var init = function (intermediaryArray) {
				underTest = new MAPJS.MapModel(
					observable({}),
					function () {
						return {};
					},
					['What', 'a', 'beautiful', 'idea!'],
					intermediaryArray
				);
				underTest.setIdea(anIdea);
				spyOn(Math, 'random').andReturn(0.6);
				underTest.selectNode(2);
				spyOn(anIdea, 'insertIntermediate');
			};
			it('should invoke idea.insertIntermediate with the id of the selected node and a random title', function () {
				init();
				underTest.insertIntermediate();
				expect(anIdea.insertIntermediate).toHaveBeenCalledWith(2, 'beautiful');
			});
			it('should invoke idea.insertIntermediate a random title from the intermediary array if specified', function () {
				init(['What', 'a', 'stupid', 'idea!']);
				underTest.insertIntermediate();
				expect(anIdea.insertIntermediate).toHaveBeenCalledWith(2, 'stupid');
			});
			it('should not invoke idea.insertIntermediate when nothing is selected', function () {
				spyOn(anIdea, 'insertIntermediate');
				underTest.insertIntermediate();
				expect(anIdea.insertIntermediate).not.toHaveBeenCalled();
			});
			it('should not invoke anything if input is disabled', function () {
				init();
				underTest.setInputEnabled(false);
				underTest.insertIntermediate();
				expect(anIdea.insertIntermediate).not.toHaveBeenCalled();
			});
		});
	});
	describe('map scaling and movement', function () {
		var underTest, mapScaleChangedListener, mapMoveRequestedListener, mapViewResetRequestedListener;
		beforeEach(function () {
			underTest = new MAPJS.MapModel(observable({}));
			mapScaleChangedListener = jasmine.createSpy('mapScaleChanged');
			mapViewResetRequestedListener = jasmine.createSpy('mapViewReset');
			mapMoveRequestedListener = jasmine.createSpy('mapMoveRequested');
			underTest.addEventListener('mapScaleChanged', mapScaleChangedListener);
			underTest.addEventListener('mapViewResetRequested', mapViewResetRequestedListener);
			underTest.addEventListener('mapMoveRequested', mapMoveRequestedListener);
		});
		it('should dispatch mapScaleChanged event with 1.25 scale and no zoom point when scaleUp method is invoked', function () {
			underTest.scaleUp('toolbar');
			expect(mapScaleChangedListener).toHaveBeenCalledWith(1.25, undefined);
		});
		it('should dispatch mapViewResetRequested when resetView is called', function () {
			underTest.resetView();
			expect(mapViewResetRequestedListener).toHaveBeenCalled();
		});
		it('should dispatch mapScaleChanged event with 0.8 and no zoom point when scaleDown method is invoked', function () {
			underTest.scaleDown('toolbar');
			expect(mapScaleChangedListener).toHaveBeenCalledWith(0.8, undefined);
		});
		it('should dispatch mapScaleChanged event with scale arguments when scale method is invoked', function () {
			underTest.scale('toolbar', 777, 'zoompoint');
			expect(mapScaleChangedListener).toHaveBeenCalledWith(777, 'zoompoint');
		});
		it('should dispatch mapMoveRequested passsing args when a move is requested', function () {
			underTest.move('toolbar', 100, 200);
			expect(mapMoveRequestedListener).toHaveBeenCalledWith(100, 200);
		});
		it('should not dispatch anything when input is disabled', function () {
			underTest.setInputEnabled(false);
			underTest.scale('toolbar', 777, 'zoompoint');
			underTest.move('toolbar', 100, 200);
			underTest.resetView();
			expect(mapMoveRequestedListener).not.toHaveBeenCalled();
			expect(mapScaleChangedListener).not.toHaveBeenCalled();
			expect(mapViewResetRequestedListener).not.toHaveBeenCalled();
		});
	});
	describe('Selection', function () {
		var nodeSelectionChangedListener, anIdea, underTest;
		beforeEach(function () {
			anIdea = MAPJS.content({
				id: 1,
				title: 'center',
				ideas: {
					'-2': {
						id: 2,
						title: 'lower left'
					},
					'-1': {
						id: 3,
						title: 'upper left'
					},
					1: {
						id: 4,
						title: 'upper right',
						ideas: {
							1: { id: 7, title: 'cousin above' }
						}
					},
					2: {
						id: 5,
						title: 'lower right',
						ideas : {
							1: { id: 6, title: 'cousin below' }
						}
					}
				}
			});
			underTest = new MAPJS.MapModel(observable({}), function () {
				return {
					nodes: {
						1: { x: 0, y: 10 },
						2: { x: -10, y: 10},
						3: { x: -10, y: -10 },
						4: { x: 10, y: 10 },
						5: { x: 10, y: 30 },
						6: { x:	50, y: 10 },
						7: { x:	50, y: -10 }
					}
				};
			});
			underTest.setIdea(anIdea);
			nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);
		});
		it('should select the intermediate when it is inserted', function () {
			var newId;
			anIdea.addEventListener('changed', function (evt, args) {
				if (evt === 'insertIntermediate') {
					newId = args[2];
				}
			});
			underTest.selectNode(6);
			nodeSelectionChangedListener.reset();
			underTest.insertIntermediate();
			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(newId, true);
		});
		it('should select parent when a node is deleted', function () {
			underTest.selectNode(6);
			underTest.removeSubIdea('toolbar');
			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(5, true);
		});
		it('should select parent when a node is cut', function () {
			underTest.selectNode(6);
			underTest.cut('toolbar');
			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(5, true);
		});
		it('should select pasted node when pasted', function () {
			underTest.selectNode(6);
			underTest.copy('toolbar');
			underTest.paste('toolbar');
			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(8, true);
		});
		describe('selectNode', function () {
			it('should dispatch nodeSelectionChanged when a different node is selected', function () {
				underTest.selectNode(2);
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(2, true);
			});
			it('should dispatch nodeSelectionChanged with false and a previous node when a different node is selected', function () {
				underTest.selectNode(1);
				nodeSelectionChangedListener.reset();
				underTest.selectNode(2);
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, false);
			});
			it('should not dispatch nodeSelectionChanged when the node is already selected', function () {
				underTest.selectNode(1);
				nodeSelectionChangedListener.reset();
				underTest.selectNode(1);
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
			it('should not change selection if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.selectNode(2);
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
		});
		describe('selectNodeRight', function () {
			it('should select lowest ranking child when currently selected node is right of central node', function () {
				underTest.selectNodeRight();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(4, true);
			});
			it('should not change selection if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.selectNodeRight();
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
			it('should expand and select lowest ranking child when currently selected node is collapsed and to the right of central node', function () {
				underTest.collapse('source', true);
				underTest.selectNodeRight();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(4, true);
				expect(anIdea.getAttr('collapsed')).toBeFalsy();
			});
			it('should select parent node when currently selected node left of central node', function () {
				underTest.selectNode(3);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeRight();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, true);
			});
		});
		describe('selectNodeLeft', function () {
			it('should select lowest ranking child when currently selected node is left of central node', function () {
				underTest.selectNodeLeft();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(3, true);
			});
			it('should expand the node and select lowest ranking child when selected node is collapsed and left of central node', function () {
				underTest.collapse('source', true);
				underTest.selectNodeLeft();
				expect(anIdea.getAttr('collapsed')).toBeFalsy();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(3, true);
			});
			it('should select parent node currently selected node right of central node', function () {
				underTest.selectNode(5);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeLeft();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, true);
			});
			it('should not change selection if input is disabled', function () {
				underTest.setInputEnabled(false);
				underTest.selectNodeLeft();
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
		});
		describe('selectNodeUp', function () {
			it('should select sibling above', function () {
				underTest.selectNode(5);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeUp();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(4, true);
			});
			it('should select closest node above if no sibling', function () {
				underTest.selectNode(6);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeUp();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(7, true);
			});
			it('should not change selection when input is disabled', function () {
				underTest.selectNode(6);
				nodeSelectionChangedListener.reset();
				underTest.setInputEnabled(false);
				underTest.selectNodeUp();
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
		});
		describe('selectNodeDown', function () {
			it('should select sibling below when selectNodeDown invoked', function () {
				underTest.selectNode(4);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeDown();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(5, true);
			});
			it('should select closest node below if no sibling', function () {
				underTest.selectNode(7);
				nodeSelectionChangedListener.reset();
				underTest.selectNodeDown();
				expect(nodeSelectionChangedListener).toHaveBeenCalledWith(6, true);
			});
			it('should not change selection when input is disabled', function () {
				underTest.selectNode(7);
				nodeSelectionChangedListener.reset();
				underTest.setInputEnabled(false);
				underTest.selectNodeDown();
				expect(nodeSelectionChangedListener).not.toHaveBeenCalled();
			});
		});
	});
	describe('analytic events', function () {
		var underTest, analyticListener,
			reset = function () {
				underTest = new MAPJS.MapModel(observable({}), function () {
					return {
						nodes: {
							1: { x: 0 },
							2: { x: -10 },
							3: { x: -10 },
							4: { x: 10 },
							5: { x: 10 }
						}
					};
				});
				var anIdea = MAPJS.content({
					id: 1,
					title: 'center',
					ideas: {
						'-2': {
							id: 2,
							title: 'lower left'
						},
						'-1': {
							id: 3,
							title: 'upper left'
						},
						1: {
							id: 4,
							title: 'upper right'
						},
						2: {
							id: 5,
							title: 'lower right',
							ideas : {
								1: {
									id: 6
								}
							}
						}
					}
				});
				underTest.setIdea(anIdea);
				analyticListener = jasmine.createSpy();
				underTest.addEventListener('analytic', analyticListener);
			};
		beforeEach(function () {
			reset();
		});
		it('should dispatch analytic event when methods are invoked', function () {
			var methods = ['cut', 'copy', 'paste', 'pasteStyle', 'redo', 'undo', 'scaleUp', 'scaleDown', 'move', 'moveRelative', 'addSubIdea',
				'addSiblingIdea', 'removeSubIdea', 'editNode', 'selectNodeLeft', 'selectNodeRight', 'selectNodeUp', 'selectNodeDown',
				'resetView', 'openAttachment', 'setAttachment'];
			_.each(methods, function (method) {
				reset();
				var spy = jasmine.createSpy(method);
				underTest.addEventListener('analytic', spy);
				underTest[method]('source');
				expect(spy).toHaveBeenCalledWith('mapModel', method, 'source');
			});
		});
		it('should dispatch analytic event when collapse method is invoked', function () {
			underTest.collapse('toolbar', false);

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'collapse:false', 'toolbar');
		});
		it('should dispatch analytic event when collapse method is invoked', function () {
			underTest.updateStyle('toolbar', 'propname', 'propval');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'updateStyle:propname', 'toolbar');
		});
		it('should dispatch analytic event when insertIntermediate method is invoked, unless there is nothing selected', function () {
			underTest.selectNode(6);

			underTest.insertIntermediate('toolbar');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'insertIntermediate', 'toolbar');
		});
		it('should not dispatch analytic event when insertIntermediate method is invoked and nothing selected', function () {
			underTest.insertIntermediate('toolbar');

			expect(analyticListener).not.toHaveBeenCalledWith();
		});
	});
	describe('getSelectedStyle', function () {
		var anIdea = MAPJS.content({ id: 1, style: {'v': 'x'}, ideas : {7: {id: 2, style: {'v': 'y'}}}}),
			layoutCalculator = function () {
				return {
					nodes: {
						1: {
							attr: {
								style: {
									'v': 'x'
								}
							}
						},
						2: {
							attr: {
								style: {
									'v': 'y'
								}
							}
						}
					}
				};
			},
			underTest;
		beforeEach(function () {
			underTest = new MAPJS.MapModel(observable({}), layoutCalculator);
			underTest.setIdea(anIdea);
		});
		it('retrieves root node style by default', function () {
			expect(underTest.getSelectedStyle('v')).toEqual('x');
		});
		it('retrieves root node style by default', function () {
			underTest.selectNode(2);
			expect(underTest.getSelectedStyle('v')).toEqual('y');
		});
	});
	describe('Links', function () {
		var anIdea = MAPJS.content({
				id: 1,
				title: '1',
				ideas : {
					7: {
						id: 2,
						title: '2',
						ideas: {
							77: {
								id: 3,
								title: '3'
							},
							88: {
								id: 4,
								title: '4'
							},
							99: {
								id: 5,
								title: '5'
							}
						}
					}
				},
				links: [{
					ideaIdFrom: 1,
					ideaIdTo: 4
				}]
			}),
			layoutCalculator,
			underTest;
		beforeEach(function () {
			layoutCalculator = jasmine.createSpy();
			layoutCalculator.andReturn({
				nodes: {},
				links: [{
					ideaIdFrom: 1,
					ideaIdTo: 4
				}]
			});
			underTest = new MAPJS.MapModel(observable({}), layoutCalculator);
			underTest.setIdea(anIdea);
		});
		it('should invoke content.addLink when addLink method is invoked', function () {
			spyOn(anIdea, 'addLink');

			underTest.addLink(2);

			expect(anIdea.addLink).toHaveBeenCalledWith(1, 2);
		});
		it('should dispatch linkCreated event when a new link is created', function () {
			var linkCreatedListener = jasmine.createSpy('linkCreated');
			underTest.addEventListener('linkCreated', linkCreatedListener);
			layoutCalculator.andReturn({
				nodes: {},
				links: [
					{
						ideaIdFrom: 1,
						ideaIdTo: 4
					}, {
						ideaIdFrom: 1,
						ideaIdTo: 3
					}
				]
			});

			underTest.addLink(3);

			expect(linkCreatedListener).toHaveBeenCalledWith({
				ideaIdFrom: 1,
				ideaIdTo: 3
			});
			expect(linkCreatedListener).not.toHaveBeenCalledWith({
				ideaIdFrom: 1,
				ideaIdTo: 4
			});
		});
		it('should dispatch linkRemoved event when a link is removed', function () {
			var linkRemovedListener = jasmine.createSpy('linkRemovedListener');
			underTest.addEventListener('linkRemoved', linkRemovedListener);
			layoutCalculator.andReturn({
				nodes: {},
				links: [
					{
						ideaIdFrom: 1,
						ideaIdTo: 3
					}
				]
			});

			underTest.removeLink(1, 4);

			expect(linkRemovedListener).toHaveBeenCalledWith({
				ideaIdFrom: 1,
				ideaIdTo: 4
			});
		});
		it('should be able to add two links', function () {
			var linkCreatedListener = jasmine.createSpy('linkCreated');
			underTest.addEventListener('linkCreated', linkCreatedListener);
			layoutCalculator.andReturn({
				nodes: {},
				links: [
					{
						ideaIdFrom: 1,
						ideaIdTo: 4
					}, {
						ideaIdFrom: 1,
						ideaIdTo: 3
					}
				]
			});
			underTest.addLink(3);
			layoutCalculator.andReturn({
				nodes: {},
				links: [
					{
						ideaIdFrom: 1,
						ideaIdTo: 4
					}, {
						ideaIdFrom: 1,
						ideaIdTo: 3
					}, {
						ideaIdFrom: 1,
						ideaIdTo: 5
					}
				]
			});

			underTest.addLink(5);

			expect(linkCreatedListener).toHaveBeenCalledWith({
				ideaIdFrom: 1,
				ideaIdTo: 5
			});
		});
		it('should dispatch linkSelected event when selectLink method is invoked', function () {
			var linkSelectedListener = jasmine.createSpy('linkSelectedListener');
			underTest.addEventListener('linkSelected', linkSelectedListener);

			underTest.selectLink({ ideaIdFrom: 1, ideaIdTo: 4 }, { x: 100, y: 100 });

			expect(linkSelectedListener).toHaveBeenCalledWith({ ideaIdFrom: 1, ideaIdTo: 4 }, { x: 100, y: 100 });
		});
	});
});
