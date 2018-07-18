
// npm -g i documentation
// $ documentation build --config documentation.yml ma-client-services.js -f html -o api
// or documentation serve --config documentation.yml --watch ma-client-services.js
// note: don't upload css else fix in S3
// version should sync w/ nbake version due to -a

/**
 * version v3.07.22
 */
console.log('ma-client-services', 'v3.07.22')

/**
* Login and logout to Meta Admin Service
* @example
   const aa = new AdminAuth()
   aa.save('123')
   console.log(aa.secret)

   const  baseURL = 'http://localhost:9083'
const aSrv = new MetaAdminService(baseURL, aa.secret)
*/
class AdminAuth {
   /**
   * @param secret that you get from admin.yaml on server
   */
   save(secret) {
      sessionStorage.setItem('maAuth', secret)
   }
   /**
   * @returns secret used for MetaAdminService
   */
   get secret() {
      return sessionStorage.getItem('maAuth')
   }
   /**
    @returns true if secret exists
    */
   exists() {
      if(!this.secret)
         return false
      if(this.secret.length<2)
         return false
      return true
   }
   /**
    * Clear, for logout
   */
   clear() {
      sessionStorage.removeItem('maAuth')
   }
}//()

/**
* Create new MetaAdminService instance.
* It needs axios loaded before, ex: https://unpkg.com/axios/dist/axios.min.js.
* @returns MetaAdminService instance
* @param baseUrl ex: 'http://localhost:9083'
* @param secret ex: '123'
* @example
*   loadjs('/ma-client-services.js','ma-client')
*   loadjs.ready(['ma-client'], function () {
*   const  baseURL = 'http://localhost:9083'
*   const aSrv = new MetaAdminService(baseURL, '123')
*    aSrv.getLast().then(function(resp) {
*        console.log(resp.data)
*    }).catch(function (error) {
*        console.log(aSrv.getError(error))
*    })
*    })//ready
*/
class MetaAdminService {
   constructor(baseURL_, secret) {
      console.log(secret)
      this.service = axios.create({
         baseURL: baseURL_
         , auth: {
            username: 'admin',
            password: secret
         }
      })
   }//cons

   /**
    * Gets the error
    * @returns error from the catch
    * @param error
    */
   getError(error) {
      if(!error.response) return error
      if(error.response.data) return (error.response.data)
      return error.response.statusText
   }

   /**
    * Get the last message from the last executed command
    * @returns a promise, than( resp.dat )/catch{error}
    * @param folder folder - ex '/'
    */
   getLast() {
      return this.service.get('/api/last')
   }
   /**
    * Does a nbake 'bake' in that folder.
    * @returns a promise, than( resp.dat )/catch{error}
    * @param folder folder - ex '/'
    */
   bake(folder) {
		let dir = '?folder='+folder
      return this.service.get('/api/bake'+dir)
   }
   /**
    * Does a nbake -t 'tag process' in that folder.
    * @returns a promise, than( resp.dat )/catch{error}
    * @param folder folder - ex '/'
    */
   tag(folder) {
		let dir = '?folder='+folder
      return this.service.get('/api/tag'+dir)
   }
   /**
    * Does a nbake -i 'itemize' from the mount
    * @returns a promise, than( resp.dat )/catch{error}
    * @param folder folder - ex '/blog'
    */
   itemize(folder) {
      let dir = '?folder='+folder
      return this.service.get('/api/itemize'+dir)
   }
   /**
    * Try to get title, image and desc of an url. Can be used for linkblog
    * @returns a promise, than( resp.dat )/catch{error}
    * @param url ex 'https://www.usatoday.com/sports/'
    */
   scrape(url) {
      let arg = '?url='+btoa(url)
      return this.service.get('/api/scrape'+arg)
   }
   /**
    * Creates a new link blog item
    * @returns a promise, than( resp.dat )/catch{error}
    * @param src ex '/blog/one'
    * @param dest ex '/blog/newOne'
    * @param url ex 'https://www.usatoday.com/sports/'
    */
   newLinkBlog(src, dest, url) {
      let arg = '?url='+btoa(url)
      arg = arg + '&src=' + src
      arg = arg + '&dest=' + dest
      console.log(arg)
      return this.service.get('/api/newLinkBlog'+arg)
   }

}//class

/**
 * Is the user logged in, based on saved cookie
 @param url of service, ex:
 @returns a promise
 @example
   isLoggedIn(baseURL).then(function() {//ok
      console.log('Lxxx yes')
   }, function() {//rejected
      console.log('LXXX no')
   })
*/
function isLoggedIn(url) {
   const aa = new AdminAuth()
   return new Promise(function(resolve, reject) {
      if( aa.exists() ) {
         const  baseURL = url
         let maSrv = new MetaAdminService(baseURL, aa.secret)
         maSrv.getLast().then(function(resp) {
            console.log(resp.data)
            resolve()
         }).catch(function (error) {
            console.log(error)
            console.log(maSrv.getError(error))
            reject()
         })
      } else //fi, no cookie
         reject()
   }) // pro
}//()

