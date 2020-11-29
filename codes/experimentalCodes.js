const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
let result = [];
axios.get("https://m.mhxin.com/manhua/douluodalu4zhongjidouluo/1077515.html")
    .then(resp => {
        const $ = cheerio.load(resp.data);
        let command = $("div#images").next().html().split("}");
        command[7]="console.log(p.split('<p>')[1].split('</p>')[0].split('/')[1]);let pushFunc=p.split(';').slice(0,5);let url=pushFunc[4].split('\"')[1];pushFunc[3]=pushFunc[3].split('}').slice(0,3).join('}')+'}result.push(getImageUrl(\\''+url+'\\'))';console.log(url);return pushFunc.slice(0,4).join(';')";
        eval(command.join("}"));
        console.log(command);
        console.log(result)
    });
/*
let result;
eval(function(p,a,c,k,e,d){
    e=function(c){
        return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))
    };
    if(!''.replace(/^/,String)){
        while(c--){
            d[e(c)]=k[c]||e(c)
        }
        k=[function(e){
            return d[e]
        }];
        e=function(){
            return'\\w+'
        };
        c=1
    };
    while(c--){
        if(k[c]){
            p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])
        }
    }
    let s = p.split(";").slice(0,5);
    let u = s[4].split("\"")[1];
    s[3] = s[3].split("}").slice(0,3).join("}")+"}result = getImageUrl('"+u+"')"
    return s.slice(0,4).join(";")
}('6 C=\'//X.L.M/N?Q=R&O=1\';6 G="m://T.H.h";6 z="m://4.H.h";e 9(5){D(5.J(/^(\\/r\\/?)/i)){f G+5}U D(5.J(/^(\\/|l?)/i)){f z+5}f 5}e E(){6 d=S P();d.7=9("/r/y-F-A/0");d.K=e(){j.g=\'<a q="/s/t/u-2.v"><3><4 b="w-o: 8;c:x;" 7="\'+9("/r/y-F-A/0")+\'" /><p>1/Y</p></3></a><4 b="w-o: 8;c:8;"  7="\'+9("/r/n-B/1")+\'">\'};d.1a=e(){j.g=\'<a q="/s/t/u-2.v"><3 W="17"  b="c:x;" ><4 b="c:8;" 7="\'+9("/r/n-B/1")+\'" I=""><4 7="m://18.16.h/l/15/14.13" I=""> <p>图片加载失败，点击刷新页面试试</p><p>刷新几次都无法加载就翻下一页吧</p></3></a>\';6 3=k.12(\'3\');3.g=\'<3 b="c: 8;"><4 7="\'+C+\'"></3>\';k.11.10(3)}}6 j=k.Z(\'l\');E();19.V();',62,73,'|||div|img|image|var|src|none|getImageUrl||style|display|v2a2a9|function|return|innerHTML|com||vafca0|document|images|https|NjY7Il5Iv_5kAaPDk7LDszViZmU3MjdkNzY2MjAzMTM0MDM3YzJhYTY4MGJjNjlkYmM5NjNkNmY1YWIyOWUzNDg3MjlhOTIxYjY2YTEwMTXK4m4dW30hX0E|events||href||manhua|xianghemowangdarenjiehun|793549|html|pointer|block|L2W9kN2wWbAQHwTZZ8QxcTg4ZWI3MzgzNWE1NDFjNjlhZWFiNGQ1OGQ3Y2E2MWVkMTY0OWFjZjQ4Zjg0ZDc1N2JjYzgxZjE4ZGJiMzAxNTI6AefVrCsiHby3tQX6d30nV|cih|H16y2RQ8t0GmVs1GfjKo6zyLm7SKx4RifuBs_pndJBNb_BNR0t714qbNQtUghPIHVyoc3PsH7|e9ygVc4NuqJfoAG1fZ5agk03KTLjk2VkuEXr656bhZywRaxtyHE7noC1cjU2GH7fcCrB6Y92HaXDe2jlowMNsgA1EP7cj7n9KehPB7U9SFKt_zUBJU16lQQX_YoIYKZKi2Q1Gn7x|esi|if|loadImage|XRjkZwaFf2WIiWG6uowR6jJllebw6ZQWpwpOeRekTHGsIv3mycLo|cirh|mhxin|alt|match|onload|51|la|go1|pvFlag|Image|id|4187563|new|res0804|else|initBan|class|ia|27|getElementById|append|body|createElement|png|error|default|duoduomh|fail|img1|sinChapter|onerror'.split('|'),0,{}))
/*
axios.get(result,{responseType: 'arraybuffer'}).then(resp => resp.data).then(data => {
    fs.writeFileSync('/home/zorin/Desktop/a.jpg',data);
});
/*
axios.get("https://m.mhxin.com/manhua/xianghemowangdarenjiehun/793549.html")
    .then(resp => console.log(resp.data));
*/
