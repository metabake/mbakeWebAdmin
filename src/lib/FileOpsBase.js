"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileHound = require("filehound");
const logger = require('tracer').console();
const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
class Dirs {
    constructor(dir_) {
        let dir = Dirs.slash(dir_);
        this.dir = dir;
    }
    static slash(path_) {
        return path_.replace(/\\/g, '/');
    }
    static goUpOne(dir) {
        return path.resolve(dir, '..');
    }
    getInDir(sub) {
        console.log('method renamed use getFilesIn');
        return this.getFilesIn(sub);
    }
    getFilesIn(sub) {
        const rec = FileHound.create()
            .paths(this.dir + sub)
            .findSync();
        let ret = [];
        const ll = this.dir.length + sub.length;
        for (let s of rec) {
            let n = s.substr(ll);
            ret.push(n);
        }
        return ret;
    }
    getShort() {
        let lst = this.getFolders();
        let ret = [];
        const ll = this.dir.length;
        logger.info(this.dir, ll);
        for (let s of lst) {
            let n = s.substr(ll);
            ret.push(n);
        }
        return ret;
    }
    getFolders() {
        logger.info(this.dir);
        const rec = FileHound.create()
            .paths(this.dir)
            .findSync();
        let ret = [];
        for (let val of rec) {
            val = Dirs.slash(val);
            let n = val.lastIndexOf('/');
            let s = val.substring(0, n);
            ret.push(s);
        }
        return Array.from(new Set(ret));
    }
}
exports.Dirs = Dirs;
class Dat {
    constructor(path__) {
        let path_ = Dirs.slash(path__);
        this._path = path_;
        let y;
        if (fs.existsSync(path_ + '/dat.yaml'))
            y = yaml.load(fs.readFileSync(path_ + '/dat.yaml'));
        if (!y)
            y = {};
        this.props = y;
        let keys = Object.keys(y);
        if (keys.includes('include'))
            this._addData();
    }
    write() {
        return new Promise((resolve, reject) => {
            try {
                let y = yaml.dump(this.props, {
                    skipInvalid: true,
                    noRefs: true,
                    noCompatMode: true,
                    condenseFlow: true
                });
                let p = this._path + '/dat.yaml';
                logger.info(p);
                fs.writeFileSync(p, y);
                resolve('OK');
            }
            catch (err) {
                logger.info(err);
                reject(err);
            }
        });
    }
    set(key, val) {
        this.props[key] = val;
    }
    _addData() {
        let jn = this.props.include;
        let fn = this._path + '/' + jn;
        logger.info(fn);
        let jso = fs.readFileSync(fn);
        Object.assign(this.props, JSON.parse(jso.toString()));
    }
    getAll() {
        return this.props;
    }
}
exports.Dat = Dat;
class FileOps {
    constructor(root_) {
        this.root = Dirs.slash(root_);
    }
    count(fileAndExt) {
        const files = FileHound.create()
            .paths(this.root)
            .depth(0)
            .match(fileAndExt + '*')
            .findSync();
        return files.length;
    }
    clone(src, dest) {
        return new Promise((resolve, reject) => {
            logger.info('copy?');
            fs.copySync(this.root + src, this.root + dest);
            let p = this.root + dest;
            logger.info(p);
            const d = new Dat(p);
            d.write();
            logger.info('copy!');
            resolve('OK');
        });
    }
    write(destFile, txt) {
        logger.info(this.root + destFile);
        fs.writeFileSync(this.root + destFile, txt);
    }
    read(file) {
        return fs.readFileSync(this.root + file).toString();
    }
    remove(path) {
        let dir_path = this.root + path;
        logger.info('remove:' + dir_path);
        if (fs.existsSync(dir_path)) {
            fs.readdirSync(dir_path).forEach(function (entry) {
                fs.unlinkSync(dir_path + '/' + entry);
            });
            fs.rmdirSync(dir_path);
        }
    }
    removeFile(path) {
        let file_path = this.root + path;
        fs.unlinkSync(file_path);
    }
}
exports.FileOps = FileOps;
module.exports = {
    Dat, Dirs, FileOps
};
