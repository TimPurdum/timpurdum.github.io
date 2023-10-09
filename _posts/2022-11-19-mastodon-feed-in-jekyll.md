---
layout: post
title: "Adding a Mastodon Feed to your Blog"
---

While I was [setting up my new Jekyll static blog site](2022-11-07-static-site-width-jekyll), I have also been investigating the rapidly growing world of [Mastodon](https://joinmastodon.org/) and the [Fediverse](https://www.fediverse.to/). I wanted to bring the two worlds together, and share a bit of my Mastodon feed on my website. So I threw together a JavaScript function to import and display my feed. This is made possible by the fact that every Mastodon feed is also an [RSS](https://en.wikipedia.org/wiki/RSS) feed. For example, if you go to https://dotnet.social/@TimPurdum.rss, you will see my feed as RSS XML.

Grabbing this feed in modern JavaScript is a breeze with `fetch`.

```javascript
fetch(rss_url)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
        console.log(data);
    };
```

Digging into the XML feed, I realized that the `description` node is already encoded HTML.

```xml
<description>&lt;p&gt;They&amp;#39;ll always be toots to me&lt;/p&gt;</description>
```

Unfortunately, because of the encoding, we can't inject this directly into a DOM element as `innerHTML`. Instead, we need to decode it first. The simplest way to do this is to create a temporary `HTMLTextArea` element and use that to parse the encoded string.

```javascript
function decodeEntity(inputStr) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = inputStr;
    return textarea.value;
}
```

Now we can pass the decoded value to `innerHTML`.

```javascript
.then(data => {
    const items = data.querySelectorAll("item");
    items.forEach(el => {
        let content = el.querySelector("description").innerHTML.trim();
        let article = document.createElement('article');
        article.innerHTML += decodeEntity(content);
    };
})
```

That's the basics! The full code is [here](https://github.com/TimPurdum/timpurdum.github.io/blob/main/main.js), and includes parsing the `Date` of each post and creating click-through links. Checkout the results on [my home page](https://timpurdum.com)! And follow me on Mastodon to talk about software development, especially with #dotnet and #csharp!
