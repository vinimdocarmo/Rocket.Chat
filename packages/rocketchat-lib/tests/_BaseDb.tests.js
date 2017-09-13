/* eslint-env mocha */
/* globals ModelsBaseDb, sinon */

import { expect } from 'chai';
import { EventEmitter } from 'events';

describe('ModelsBaseDb', function() {

	function createSpyModel() {
		return {
			_ensureIndex: sinon.spy(),
			find: sinon.spy(),
			findOne: sinon.spy(),
			insert: sinon.spy(),
			update: sinon.spy(),
			remove: sinon.spy()
		};
	}

	describe('when creating a new instance', function() {
		let modelsBaseDb;
		let modelName;
		let baseModel;

		describe('and passing the string \'user\' as first argument', function() {

			describe('and a object as the second argument', function() {

				before(function() {
					modelName = 'user';
					baseModel = {};
					modelsBaseDb = new ModelsBaseDb(modelName, baseModel);
				});

				it('the new object should be and instance of EventEmitter', function() {
					expect(modelsBaseDb).to.be.instanceOf(EventEmitter);
				});

				it('the property name should be equal to \'user\'', function() {
					expect(modelsBaseDb.name).to.be.equal(modelName);
				});

				it('the property collectionName should be equal to \'rocketchat_user\'', function() {
					expect(modelsBaseDb.collectionName).to.be.equal(`rocketchat_${ modelName }`);
				});

				it('the property model should be an instance of Mongo.Collection', function() {
					expect(modelsBaseDb.model).to.be.instanceOf(Mongo.Collection);
				});

				it('the second argument should be set to the property baseModel', function() {
					expect(modelsBaseDb.baseModel).to.be.equal(baseModel);
				});

				it('the property originals should be an object with the keys \'insert\', \'update\' and \'remove\' as functions', function() {
					expect(modelsBaseDb.originals.insert).to.be.instanceOf(Function);
					expect(modelsBaseDb.originals.update).to.be.instanceOf(Function);
					expect(modelsBaseDb.originals.remove).to.be.instanceOf(Function);
				});
			});
		});

		describe('and passing a pre existing model as first argument', function() {
			let model;

			before(function() {
				model = createSpyModel();

				new ModelsBaseDb(model);
			});

			it('should call the method model._ensureIndex with { _updatedAt: 1 } as the argument', function() {
				expect(model._ensureIndex.called).ok;
				expect(model._ensureIndex.calledWith({ _updatedAt: 1 })).ok;
			});
		});

		describe('then calling the method setUpdatedAt()', function() {

			before(function() {
				modelsBaseDb = new ModelsBaseDb('message');
			});

			describe('passing a empty object as argument', function() {
				let record;
				let returnedRecord;

				before(function() {
					record = {};
					returnedRecord = modelsBaseDb.setUpdatedAt(record);
				});

				it('should add an attribute _updatedAt of the type Date', function() {
					expect(record._updatedAt).to.be.instanceOf(Date);
				});

				it('should return the object passed as argument', function() {
					expect(returnedRecord).to.be.equal(record);
				});
			});

			describe('passing an object with at least one key that starts with \'$\'', function() {
				let record;

				before(function() {
					record = { $key: 'foo', key: 'bar' };
					modelsBaseDb.setUpdatedAt(record);
				});

				it('should add an attribute $set of type Object', function() {
					expect(record.$set).to.be.instanceOf(Object);
				});

				it('should add an attribute _updatedAt of type Date in the object $set', function() {
					expect(record.$set._updatedAt).to.be.instanceOf(Date);
				});
			});
		});

		describe('then calling the method find()', function() {
			let model;
			let theseArguments;

			before(function() {
				theseArguments = ['foo', 'bar'];

				model = createSpyModel();

				modelsBaseDb = new ModelsBaseDb(model);
				modelsBaseDb.find(...theseArguments);
			});

			it('should call the method find of the model', function() {
				expect(model.find.called).ok;
				expect(model.find.calledWith(...theseArguments)).ok;
			});
		});

		describe('then calling the method findOne()', function() {
			let model;
			let theseArguments;

			before(function() {
				theseArguments = ['foo', 'bar'];

				model = createSpyModel();

				modelsBaseDb = new ModelsBaseDb(model);
				modelsBaseDb.findOne(...theseArguments);
			});

			it('should call the method findOne of the model', function() {
				expect(model.findOne.called).ok;
				expect(model.findOne.calledWith(...theseArguments)).ok;
			});
		});

		describe('then calling the method findOneById()', function() {
			let model;
			let theseArguments;

			before(function() {
				theseArguments = [1, {}];

				model = createSpyModel();

				modelsBaseDb = new ModelsBaseDb(model);
				modelsBaseDb.findOneById(...theseArguments);
			});

			it('should call the method findOne of the model passing the where clause and options', function() {
				expect(model.findOne.called).ok;
				expect(model.findOne.calledWith({ _id: theseArguments[0] }, theseArguments[1])).ok;
			});

		});

		describe('then calling the method findOneByIds()', function() {
			let model;
			let theseArguments;

			before(function() {
				theseArguments = [[1, 2, 3], {}];

				model = createSpyModel();

				modelsBaseDb = new ModelsBaseDb(model);
				modelsBaseDb.findOneByIds(...theseArguments);
			});

			it('should call the method findOne of the model passing the where clause and options', function() {
				expect(model.findOne.called).ok;
				expect(model.findOne.calledWith({ _id: { $in: theseArguments[0] } }, theseArguments[1])).ok;
			});

		});
	});
});
