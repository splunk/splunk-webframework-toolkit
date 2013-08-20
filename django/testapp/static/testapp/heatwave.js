require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

// calheat!
// shows a cool looking heatmap based on different time signatures
// requires a timechart search. it dynamically guesses how to set up the
// way to show the time, but you can define any settings you want in the html
// docs: http://kamisama.github.io/cal-heatmap

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    // require("css!testapp/heatwave.css");

    var Heatwave = SimpleSplunkView.extend({

        className: "splunk-toolkit-heatwave",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type
            domain: 'hour',
            subdomain: 'min',
            maxSeries: '3',

            options: {} // the default for custom heatmap options.
        },

        output_mode: "json",

        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");

            // whenever domain or subdomain are changed, we will re-render.
            this.settings.on("change:domain", this._onDataChanged, this);
            this.settings.on("change:subdomain", this._onDataChanged, this);
        },

        createView: function() { 
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        // in this case, it looks like this:
        // [(one for each in maxSeries: {timestamp1: count, timestamp2: count, ... }]
        formatData: function(data) {

            var SplunkBucketHeaderParser = function(headerLine) {
                this.init = function(headerLine){
                    alert(headerLine);
                    self.fields = [[], [], []]
                    self.__parseAll__(headerLine)
                }

                getFieldsBefore = function(){
                    return self.fields[0]
                }

                getBucketFields = function(){
                    return self.fields[1]
                }

                getFieldsAfter = function(){
                    return self.fields[2]
                }

                __parseAll__ = function(headerLine) {
                    for (var i=0;i<headerLine.length;i++) {
                        var bucket = headerLine[i];
                        if (bucket.search("-") == -1){
                            self.fields[1].append(bucket)
                        }
                        else if (self.fields[1].length > 0){
                            self.fields[2].append(bucket)
                        }
                        else {
                            self.fields[0].append(bucket)
                        }
                    }
                }
                this.init(headerLine);
            }

            var Thresholdify = function(splunkHeader, threshold){
                this.init = function(splunkHeader, threshold){
                    // alert(splunkHeader);
                    self.splunkHeader = splunkHeader
                    self.threshold = threshold
                    self.minBuckets = self.minBucketsToMerge(splunkHeader)
                    self.maxBuckets = self.maxBucketsToMerge()

                    self.threshold = self.roundThreshold(threshold, self.getBucketsNotToMerge())
                    self.discard_min = False
                    self.discard_max = False
                }

                int_or_float = function(x) {
                    try {
                        return int(x)
                    } catch(ValueError) {
                        return float(x)
                    }
                }

                roundThreshold = function(threshold, buckets) {
                    logger.error('threshold, buckets: %s %s' % (threshold, buckets))
                    if (threshold.min > self.int_or_float(buckets[0].split("-")[0]))
                        minThreshold = self.int_or_float(buckets[0].split("-")[0])
                    else 
                        minThreshold = threshold.min

                     
                    if (threshold.max < self.int_or_float(buckets[-1].split("-")[1]))
                        maxThreshold = self.int_or_float(buckets[-1].split("-")[1])
                    else 
                        maxThreshold = threshold.max

                    return Threshold(minThreshold, maxThreshold)
                }

                minBucketsToMerge = function(splunkHeader) {
                    result = 0
                    var buckets = self.splunkHeader.getBucketFields();
                    for (var i=0; i<buckets.length;i++) {
                        var bucket = buckets[i];
                        logger.error('bucket: %s' % bucket)
                        upperLimit = bucket.split('-')[1]
                        if (self.int_or_float(upperLimit) <= self.threshold.min)
                            result += 1
                    }

                    return result
                }

                setDiscardMin = function(value){
                    self.discard_min = value
                }

                setDiscardMax = function(value){
                    self.discard_max = value
                }

                maxBucketsToMerge = function(){
                    result = 0
                    var buckets = self.splunkHeader.getBucketFields();
                    for (var i=0; i<buckets.length;i++) {
                        var bucket = buckets[i];
                        lowerLimit = bucket.split('-')[0]
                        if (self.int_or_float(lowerLimit) >= self.threshold.max)
                            result += 1
                    }

                    return result
                }

                getBucketsNotToMerge = function(){
                    var max = self.splunkHeader.getBucketFields().length - self.maxBuckets
                    var min = self.minBuckets;
                    var array = []
                    for (var i=min; i<max; i++){
                        array.push(self.splunkHeader.getBucketFields()[i])
                    }

                   return array;

                    // return self.splunkHeader.getBucketFields()[self.minBuckets:(self.splunkHeader.getBucketFields().length - self.maxBuckets)]
                    // alert(self.splunkHeader.getBucketFields())
                }

                createHeaderWithThreshold = function(){
                    result = []
                    _.extend(self.splunkHeader.getFieldsBefore(), result)

                    if (!self.discard_min) {
                        result.push("<" + toString(self.threshold.min))
                    }

                    result.extend(self.getBucketsNotToMerge())

                    if (!self.discard_max) {
                        result.push(">" + toString(self.threshold.max))
                    }

                    _.extend(self.splunkHeader.getFieldsAfter(), result)

                    return result;
                }

                mergeBuckets = function(bucketsToMerge){
                    result = 0
                    for (var i=0; i<bucketsToMerge.length; i++) {
                        bucket = bucketsToMerge[i];
                        result += self.int_or_float(bucket)
                    }
                    return result
                }

                getMergedFields = function(bucketFields) {
                    result = []
                    // minMerge = self.mergeBuckets(bucketFields[0:self.minBuckets])
                    var minMerge = []
                    var maxMerge = []
                    for (var i=0;i<self.minBuckets;i++){
                        minMerge.push(self.minBuckets[i])
                    }
                    for (var i=(len(bucketFields) - self.maxBuckets); i<self.mergeBuckets.length;i++)
                        maxMerge.push(self.mergeBuckets[i]);

                    if (!self.discard_min) {
                        result.push(minMerge)
                    }

                    var buckets = []
                    for (var i=self.minBuckets; i<bucketFields.length - self.maxBuckets;i++){
                        buckets.push(bucketFields[i]);
                    }
                    for (var i=0; i<buckets.length; i++){
                        var bucket = buckets[i];
                        result.append(self.int_or_float(bucket))
                    }

                    if (!self.discard_max) {
                        result.push(maxMerge)
                    }

                    return result
                }

                getBeforeFieldsFromLine = function(line){
                    var array =[]
                    for (var i=0; i<self.splunkheader.getFieldsBefore().length; i++)
                        array.push(line[i])
                    return array;
                }

                getBucketFieldsFromLine = function(line){
                    var array = []
                    for (var i=self.splunkHeader.getFieldsBefore().length; i<(line.length - self.splunkHeader.getFieldsAfter().length); i++)
                        array.push(line[i])
                    return array;
                }

                getAfterFieldsFromLine = function(line){
                    var array = [];
                    for (var i=(line.length - self.splunkHeader.getFieldsAfter().length); i<line.length; i++)
                        array.push(line[i]);
                    return array;
                }

                parseDataLine = function(line){
                    result = []
                    _.extend(self.getBeforeFieldsFromLine(line), result)
                    _.extend(self.getMergedFields(self.getBucketFieldsFromLine(line)), result)
                    _.extend(self.getAfterFieldsFromLine(line), result)

                    return result
                }

                this.init(splunkHeader, threshold);
            }

            var Threshold = function(){
                    self.min = 100
                    self.max = 1000
            }

            output = {'results': []} 
            entity_type = 'results_preview';
            thr_min = 100;
            thr_max = 1000;
            dis_min = false;
            dis_max = false;
            
            var thresholdify = null;
             
            for (var i=0; i<data.length; i++){
                var row = data[i];
                if (thresholdify == null) {
                    // alert(row);
                    parser = SplunkBucketHeaderParser(row)
                    threshold = Threshold(thr_min, thr_max)

                    thresholdify = Thresholdify(parser, threshold)
                    thresholdify.setDiscardMin(dis_min)
                    thresholdify.setDiscardMax(dis_max)

                    headers = thresholdify.createHeaderWithThreshold()
                    output['results'].push(headers)
                } else {
                    newLine = []
                    for (var x=0; x<thresholdify.parseDataLine(row).length; x++)
                        var column = thresholdify.parseDataLine(row)[x];
                        newLine.push(column)
                }
                output['results'].push(newLine)
            }

            //////////////////////////////////////round 2/////////////////////////////

            count = max(10000, 0)
            entity_type = 'results_preview'

            output = {'results': [], 'fields': {}, 'span': None}
            extent = {}
            span = undefined

            for (var i=0; i<data.length; i++){
                var row = data[i];
                obj = {
                       'result': [], 
                       '_time': unicode(row['_time']) 
                      }
                if (span == undefined){
                    try{
                        span = int(unicode(row['_span']))
                    }
                    catch(e){
                        logger.debug(e)
                    }
                }
                for (var j=0; j<row.length; j++){
                    var field = row[j];
                    if (!field.substring(0, 1) === "_"){
                        try {
                            val = float(unicode(row[field]))
                            obj['result'].push([unicode(field), val])
                            limits = extent.get(field)
                            if (limits == undefined) {
                                extent[field] = {'min': val, 'max': val}
                            }
                            else {
                                if (val < limits['min']){
                                    extent[field]['min'] = val
                                }
                                else if (val > limits['max']){
                                    extent[field]['max'] = val
                                }
                            }
                        }
                        catch(e){
                            logger.debug(e)
                        }
                    }
                }
                output['results'].push(obj)
            }

            output['fields'] = extent
            output['span'] = span

            console.log(output);

            return output
        },

        updateView: function(viz, data) {
            console.log(data);
        }
            
    });
    return Heatwave;
});