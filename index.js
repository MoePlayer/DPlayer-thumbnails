#!/usr/bin/env node
var ffmpeg = require('fluent-ffmpeg');
var nsg = require('node-sprite-generator');
var Jimp = require('jimp');
var rm = require('rimraf');
var Spinner = require('cli-spinner').Spinner;
var program = require('commander');
var os = require('os');
var spinner;

function startSpinner (string, step) {
    spinner = new Spinner(`[${step}/3] %s ${string}...`);
    spinner.setSpinnerString('|/-\\');
    spinner.start();
}

var startTime = +new Date();
var tmp = os.tmpdir() + '/dplayer-thumbnails'

program
    .version('0.0.3')
    .usage('[options] <file>')
    .option('-o, --output <path>', 'thumbnails path, default: ./thumbnails.jpg', './thumbnails.jpg')
    .option('-q, --quality <n>', 'thumbnails quality, default: 60', 60)
    .description('🎉  Generate thumbnails for DPlayer')
    .action(function (file) {
        startSpinner('Screenshots generating', 1);
        ffmpeg(file)
            .screenshots({
                count: 100,
                folder: tmp,
                filename: 'screenshot%i.png',
                size: '160x?'
            })
            .on('end', function () {
                spinner.stop(true);
                console.log('[1/3] Screenshots generated!');
                startSpinner('Sprite generating', 2);

                nsg({
                    src: [
                        tmp + '/*.png'
                    ],
                    spritePath: tmp + '/sprite.png',
                    stylesheetPath: tmp + '/sprite.css',
                    layout: 'horizontal'
                }, function (err) {
                    spinner.stop(true);
                    console.log('[2/3] Sprite generated!');
                    startSpinner('Compressing', 3);

                    Jimp.read(tmp + '/sprite.png', function (err, lenna) {
                        if (err) throw err;
                        lenna.quality(parseInt(program.quality))
                            .write(program.output);
                        rm(tmp, function () {
                            spinner.stop(true);
                            console.log('[3/3] Compressing complete!');
                            console.log(`✨  Done in ${(+new Date() - startTime) / 1000}s.`);
                        });
                    });
                });
            });
    });

program.parse(process.argv);