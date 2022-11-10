---
layout: post
title: "Creating a static website with Jekyll"
---

While working on the docs site for [GeoBlazor](https://docs.geoblazor.com), I was introduced to [Jekyll](https://jekyllrb.com/). Now, I've heard of static site generators before, but this was just the perfect fit for a docs site. It also made me think of all the hoops I tend to jump through while creating static sites like this blog, that could be made simpler by using a generator and just writing good ol' markdown.

There's a lot to recommend about Jekyll. The main downside? I had to install Ruby 😜. No big deal. [Jekyll Installation Docs](https://jekyllrb.com/docs/installation/) are pretty easy to follow to get going. Here's a short list of steps for Windows (different OSes will vary):

1. Download the latest Ruby+Devkit from [RubyInstaller for Windows](https://rubyinstaller.org/downloads/).
2. Run the installer, and select to run `ridk install` on the last step. Choose the `MSYS2 and MINGW development tool chain` option.
3. Reboot (it says you can just close your terminal, but this didn't work for me).
4. Check to make sure `ruby` and `gem` are registered with the `PATH` environment variable for command line actions. I think I ran into an issue on at least one machine where I had to add the path manually (search in the windows start menu for `environment variables`).
5. Run `gem install jekyll bundler`.
6. Navigate to the folder where you want to set up your site.
7. Run `jekyll new myNewSite`, this will create a new folder (`./myNewSite`).
8. Navigate into that folder (`cd myNewSite`).
9. Run `bundle exec jekyll serve --livereload`.
10. Open your browser and navigate to <a target="_blank" href="http://localhost:4000">http://localhost:4000</a>. You should see your new site rendered!

You don't actually need the `--livereload` flag to build your site, but I choose to always use this while developing, so that I can quickly see the changes I make to markdown and css sites rendered in the browser.

These steps got me up and running locally. However, when I went to publish to GitHub Pages, 
I found a few more things I needed to add.

1. In your `Gemfile`, comment out the line starting with `gem "jekyll"`
2. Also in the `Gemfile`, uncomment the line starting with `gem "github-pages"`, and replace with `gem "github-pages", "~> 227", group: :jekyll_plugins` where 227 is the latest version of the `github-pages` gem available.
3. Run `bundle install` to install the `github-pages` gem.
4. Run `bundle add webrick` (no idea, but you'll get an error without it).

Once these steps are added, try pushing your code up to GitHub, and navigate to `https://YOURNAME.github.io` to see the code in action!