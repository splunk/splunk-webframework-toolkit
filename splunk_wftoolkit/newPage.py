#!/usr/bin/env python
import os
import sys

print sys.argv[1]

newPageName = sys.argv[1]
newPagePath = 'appserver/static/' + newPageName

if not os.path.exists(newPagePath):
    os.makedirs(newPagePath)
else:
    print 'directory exists'
    exit()

scriptTemplateFile = open('appserver/static/template/template.js', 'r')
scriptTemplate = scriptTemplateFile.read()

htmlTemplateFile = open('appserver/static/template/template.html', 'r')
htmlTemplate = htmlTemplateFile.read()

cssTemplateFile = open('appserver/static/template/template.css', 'r')
cssTemplate = cssTemplateFile.read()

newScriptFile = open(os.path.join(newPagePath, newPageName + '.js') , 'w')
newScriptFile.write(scriptTemplate)

newhtmlFile = open(os.path.join(newPagePath, newPageName + '.html') , 'w')
newhtmlFile.write(htmlTemplate)

newcssFile = open(os.path.join(newPagePath, newPageName + '.css') , 'w')
newcssFile.write(cssTemplate)

bpTemplateFile = open('default/data/ui/html/template.html', 'r')
bpTemplate = bpTemplateFile.read()

newbpFile = open('default/data/ui/html/' + newPageName + '.html', 'w')
newbpFile.write(bpTemplate)