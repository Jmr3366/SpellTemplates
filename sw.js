/*
 *
 *  Spell Templates Tool
 *  sw.js used under Apache License from github.com/GoogleChromeLabs/airhorn
 *  Modified by Riley Lahd
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

const version = "0.2.1";
const cacheName = `spelltemplates-${version}`;
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `./`,
        `./index.html`,
        `./main.css`,
        `./js/main.js`,
        `./icons/menu/icons8-add.png`,
        `./icons/menu/icons8-arrow.png`,
        `./icons/menu/icons8-circle.png`,
        `./icons/menu/icons8-man.png`,
        `./icons/menu/icons8-minus.png`,
        `./icons/menu/icons8-settings.png`,
        `./icons/menu/icons8-triangle.png`
      ])
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cn) {
            if(cn == cacheName){return false;}
            else if(cn.indexOf("spelltemplates") !== -1){console.log("Deleting cache: " + cn); return true;}
            else{return false;}
          }).map(function(cn) {
            return caches.delete(cn);
          })
        );
      })
    );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});
