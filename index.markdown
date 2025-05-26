---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

<div id="social-col">
    <script type="text/javascript" src="https://sessionize.com/api/speaker/events/9r5t5or9de/0x1x3fb393x"></script>
  <script type="text/javascript" src="https://sessionize.com/api/speaker/sessions/9r5t5or9de/1x1x4fd1c5x"></script>
    <div id="bsky-section">
        <div id="bsky-header">
            <img alt="Bluesky" style="width: 16rem;" src="images/bsky.webp">
        </div>
        <div id="bsky-feed">
            <bsky-embed
                username="timpurdum.dev"
                mode="dark"
                limit="10"
                link-target="_blank"
                link-image="true"
                load-more="true"
                disable-styles="false"
                custom-styles=".border-slate-300 { border-color: #1185fe; } article > .flex.gap-2 { flex-direction: column; overflow: hidden } article > div > div > div.items-center { flex-direction: column; align-items: start; }"
                date-format='{"type":"absolute","options":{"year":"2-digit","month":"short","day":"numeric","hour":"numeric", "minute":"numeric"}}'>
            </bsky-embed>
        </div>
  </div>
    <div id="mastodon-section">
        <div id="mastodon-header">
            <img alt="Mastodon" style="width: 16rem;" src="images/mastodon-header.png">
         </div>
        <div id="mastodon"></div>
    </div>
</div>

<script src="main.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/npm/bsky-embed/dist/bsky-embed.es.js" async></script>