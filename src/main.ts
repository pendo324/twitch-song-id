import axios from 'axios';
import { ChildProcess, exec, spawn } from 'child_process';
import dotenv from 'dotenv';
import { mkdir } from 'fs';

/**
 * Driver function
 * @param channelName channel to get clip from
 */
async function downloadStream(channelName: string): Promise<void> {
  dotenv.config();
  const folderName: string = channelName + (new Date).getTime();

  try {
    const destination: string = await createFolder(`${__dirname}/${folderName}`); // Should probably have its own dedicated folder
    const { path: videoPath } = await download(channelName, `${destination}/vid.mp4`);
    //const { path: aacPath } = await demuxToAAC(videoPath, `${destination}/out.aac`);
    const { path: wavPath } = await reencodeToWav(videoPath, `${destination}/out.wav`);
    const { duration, fingerprint } = await getFingerprint(wavPath);
    console.log(await tryId(duration, fingerprint));
  } catch (err) {
    console.log(err);
  }
}

/*function demuxToAAC(videoPath: string, outPath: string): Promise<{ msg: string, path: string }> {
  return new Promise<{ msg: string, path: string }>((resolve, reject) => {
    const ffmpeg: ChildProcess = spawn('ffmpeg', ['-i', videoPath, '-vn', '-c:a', '-bsf:a', 'aac_adtstoasc', outPath]);

    ffmpeg.on('error', (err) => {
      reject(err);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        return resolve({
          msg: '',
          path: outPath
        });
      }
      return reject(new Error(`exited with code ${code}`));
    });
  });
}*/

/**
 * Should this be reencode or demux? There is no video in the file afterall...
 * @param videoPath input video file (from Streamlink download)
 * @param outPath output pcm wav file, for use with fpcalc
 */
function reencodeToWav(videoPath: string, outPath: string): Promise<{ msg: string, path: string }> {
  return new Promise<{ msg: string, path: string }>((resolve, reject) => {
    const ffmpeg: ChildProcess = spawn('ffmpeg', ['-i', videoPath, '-vn', '-c:a', 'pcm_s16le', outPath]);

    ffmpeg.on('error', (err) => {
      reject(err);
    });

    /* debug
    ffmpeg.stdout.on('data', (data) => {
      console.log(data.toString());
    });*/

    /*ffmpeg.stderr.on('data', (data) => {
      console.log(data.toString());
      //reject(data.toString());
    });*/

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        return resolve({
          msg: 'demuxed',
          path: outPath
        });
      }
      return reject(new Error(`exited with code ${code}`));
    });
  });
}

/**
 * Uses Streamlink to download at least 20 seconds of a live Twitch stream
 * TODO: Replace Streamlink.exe with 'python streamlink' to increase portability
 * @param channelName which Twitch channel to download from
 * @param filePath where to download to
 */
function download(channelName: string, filePath: string): Promise<{ msg: string, path: string }> {
  return new Promise<{ msg: string, path: string }>((resolve, reject) => {
    const streamlink: ChildProcess = spawn('Streamlink', [`twitch.tv/${channelName}`, 'audio', '-o', filePath]);

    // I would like to know why the progress bar is put to stderr but I cbf to check the streamlink code
    streamlink.stderr.on('data', (data) => {
      let dataString: string;
      data instanceof Buffer ? dataString = data.toString() : dataString = data;

      if (dataString.startsWith('error')) {
        return reject(data);
      }

      if (dataString.startsWith('[download]', 1)) {
        let seconds: number = Number(dataString.split('KB (')[1].split('s @')[0]);
        if (seconds >= 20) {
          // Since streamlink.kill wasn't working, I had to resort to extreme measures
          if (process.platform === 'win32') {
            exec('taskkill /pid ' + streamlink.pid + ' /T /F', (err) => {
              if (err) {
                reject(err);
              }
            });
          } else {
            process.kill(streamlink.pid);
          }

          resolve({
            msg: `Downloaded ${seconds} seconds to ${filePath}`,
            path: filePath
          });
        }
      }
    });

    streamlink.on('close', (code) => {
      if (code > 0) {
        reject(new Error('did not exit cleanly'));
      }
    });
  });
}

/**
 * Makes a directory for the particular clip
 * @param destination where the folder should be
 */
function createFolder(destination: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    mkdir(destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(destination);
      }
    });
  });
}

/**
 * Calls to fpcalc to get a fingerprint of the audio clip
 * @param audioPath path to audio file to be IDed
 */
function getFingerprint(audioPath: string): Promise<{ duration: number, fingerprint: string }> {
  return new Promise<{ duration: number, fingerprint: string }>((resolve, reject) => {
    const fpcalc: ChildProcess = spawn('fpcalc', [audioPath]);

    fpcalc.stderr.on('data', (data) => {
      reject(new Error(data.toString()));
    });

    fpcalc.stdout.on('data', (data) => {
      let dataString: string;
      data instanceof Buffer ? dataString = data.toString() : dataString = data;

      const duration: number = Number(dataString.split('DURATION=')[1].split('FINGERPRINT=')[0]);
      const fingerprint: string = dataString.split('DURATION=')[1].split('FINGERPRINT=')[1].trim();

      console.log(fingerprint);

      /*const match: RegExpMatchArray = dataString.match(/DURATION=(.*)[\n]FINGERPRINT=(.*)/);
      console.log(match);
      const duration: number = Number(match[1]);
      const fingerprint: string = match[2];*/

      resolve({
        duration,
        fingerprint
      });
    });
  });
}

/**
 * Hits the API with the song information in an attemp to ID the clip
 * Needs to be replaced with an API that can ID partial clips
 * @param duration how long the audio clip is
 * @param fingerprint the fingerprint of the audio clip
 */
function tryId(duration: number, fingerprint: string): Promise<JSON> {
  return new Promise<JSON>((resolve, reject) => {
    return axios.get('http://api.acoustid.org/v2/lookup', {
      params: {
        fingerprint,
        duration,
        client: process.env.ACOUSTID_CLIENT_ID
      }
    }).then((response) => {
      resolve(response.data);
    }, (err) => {
      reject(err);
    });
  });
}

downloadStream('thesingular1ty');
