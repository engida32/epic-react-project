// this is for extra credit

import React from 'react'

const {client} = require('utils/api-client')

let queue = []

setInterval(SendProfileQueue, 5000)

function SendProfileQueue() {
  if (!queue.length) {
    return Promise.resolve({success: true})
  }
  const queueToSend = [...queue]
  queue = []
  return client('profile', {data: queueToSend})
}

function Profiler({phases, metadata, ...props}) {
  function reportProfiler(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  ) {
    if (!phases || phases.includes(phase)) {
      queue.push({
        metadata,
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions,
        //   : [...interactions],
      })
    }
  }
  return <React.Profiler onRender={reportProfiler} {...props} />
}

export {Profiler}
