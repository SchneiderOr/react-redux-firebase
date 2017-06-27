import { omit } from 'lodash'
import { createStore, compose } from 'redux'
import composeFunc, { getFirebase } from '../../src/compose'

const reducer = sinon.spy()

const generateCreateStore = (params) =>
  compose(composeFunc(
    params ? omit(fbConfig, params) : fbConfig,
    {
      userProfile: 'users',
      enableLogging: false,
      enableRedirectHandling: false
    }
  ))(createStore)

generateCreateStore()(reducer)

const helpers = getFirebase().helpers

describe('Compose', () => {
  it('is a function', () => {
    expect(composeFunc).to.be.a.function
  })

  it('returns an object', () => {
    expect(composeFunc(fbConfig)).to.be.a.function
  })

  it('allows enabling of Firebase database logging', () => {
    expect(generateCreateStore()(reducer))
      .to.be.an.object
  })

  describe('helpers', () => {
    describe('ref', () => {
      it('exists', () => {
        expect(helpers.ref('test')).to.be.an.object
      })

      it('has child', () => {
        expect(helpers.ref('test').child('asdf')).to.be.an.object
      })
    })

    describe('set', () => {
      it('accepts object', () =>
        expect(helpers.set('test', {some: 'asdf'}))
          .to.eventually.become(undefined)
      )
    })

    describe('setWithMeta', () => {
      describe('accepts object', () => {
        it('accepts object', () =>
          expect(helpers.setWithMeta('test', {some: 'asdf'}))
            .to.eventually.become(undefined)
        )
      })

      describe('does not attach meta to string', () => {
        // TODO: confirm that data set actually does not include meta
        it('accepts object', () =>
          expect(helpers.setWithMeta('test', 'asdd'))
            .to.eventually.become(undefined)
        )
      })
    })

    describe('push', () => {
      it('accepts object', () =>
        expect(helpers.push('test', {some: 'asdf'}))
          .to.eventually.have.property('key')
      )
    })

    describe('pushWithMeta', () => {
      it('accepts object', () =>
        expect(helpers.pushWithMeta('test', {some: 'asdf'}))
          .to.eventually.have.property('key')
      )
    })

    describe('update', () => {
      it('accepts object', () =>
        // undefined represents snapshot
        expect(helpers.update('test', {some: 'asdf'}))
          .to.eventually.become(undefined)
      )
    })

    describe('updateWithMeta', () => {
      it('accepts object', () =>
        expect(helpers.updateWithMeta('test', {some: 'asdf'}))
          .to.eventually.become(undefined)
      )
    })

    describe('uniqueSet', () => {
      // remove test root after test are complete
      after(() =>
        helpers.remove('test')
      )
      it('sets if unique', () =>
        helpers.uniqueSet('test/unique', {some: 'asdf'})
      )
      it('throws if not unique', () =>
        helpers.uniqueSet('test', {some: 'asdf'})
          .catch((err) => {
            expect(err.toString()).to.equal('Error: Path already exists.')
          })
      )
      it('has on err onComplete', () => {
        const func = sinon.spy()
        return helpers.uniqueSet('test', {some: 'asdf'}, func)
          .catch((err) => {
            expect(func).to.have.been.calledOnce
            expect(err).to.exist
          })
      })
    })

    describe('remove', () =>
      helpers.remove('test')
    )

    describe('watchEvent', () => {
      it('starts watcher', () => {
        helpers.watchEvent('value', 'test')
      })
    })

    describe('unWatchEvent', () => {
      it('unWatchesEvent', () =>
        helpers.unWatchEvent('value', 'test')
      )
    })

    describe('login', () => {
      try {
        helpers.login({ email: 'test' })
      } catch (err) {
        expect(err).to.be.an.object
      }
    })

    describe('logout', () =>
      helpers.logout()
    )

    describe('createUser', () =>
      helpers.createUser({ email: 'test' }, { email: 'test' })
    )

    describe('resetPassword', () => {
      try {
        helpers.resetPassword({ email: 'test' })
      } catch (err) {
        expect(err).to.be.an.object
      }
    })

    describe('confirmPasswordReset', () => {
      try {
        helpers.confirmPasswordReset({ code: 'test', password: 'test' })
      } catch (err) {
        expect(err).to.be.an.object
      }
    })

    describe('updateProfile', () => {
      it('acccepts an object', () =>
        expect(helpers.updateProfile({ displayName: 'test' }))
          .to.eventually.become(undefined)
      )
    })

    describe('updateAuth', () => {
      it('rejects when not authenticated', () =>
        expect(helpers.updateAuth()).to.be.rejectedWith('User must be logged in to update auth.')
      )

      // TODO: test that update auth when authenticated
      it.skip('updates auth object if authenticated', () =>
        expect(helpers.updateAuth()).to.eventually.become(undefined)
      )

      // TODO: test that updateProfile is called if updateInProfile is true
      it.skip('calls update profile if updateInProfile is true', () =>
        expect(helpers.updateAuth({}, true)).to.eventually.become(undefined)
      )
    })

    describe('updateEmail', () => {
      it('rejects when not authenticated', () =>
        expect(helpers.updateEmail()).to.be.rejectedWith('User must be logged in to update email.')
      )

      // TODO: test that update auth when authenticated
      it.skip('updates auth object if authenticated', () =>
        expect(helpers.updateEmail()).to.eventually.become(undefined)
      )

      // TODO: test that updateProfile is called if updateInProfile is true
      it.skip('calls update profile if updateInProfile is true', () =>
        expect(helpers.updateEmail({}, true)).to.eventually.become(undefined)
      )
    })

    describe('storage', () => {
      try {
        helpers.storage()
      } catch (err) {
        expect(err).to.be.an.object
      }
    })
  })

  describe('throws for missing fbConfig parameters', () => {
    const errorSuffix = 'is a required config parameter for react-redux-firebase.'
    it('databaseURL', () => {
      expect(() => generateCreateStore('databaseURL')(reducer))
        .to.throw(`databaseURL ${errorSuffix}`)
    })

    it('authDomain', () => {
      expect(() => generateCreateStore('authDomain')(reducer))
        .to.throw(`authDomain ${errorSuffix}`)
    })

    it('apiKey', () => {
      expect(() => generateCreateStore('apiKey')(reducer))
        .to.throw(`apiKey ${errorSuffix}`)
    })
  })

  describe('getFirebase', () => {
    it('exports firebase instance', () => {
      expect(getFirebase()).to.be.an.object
    })
  })
})
