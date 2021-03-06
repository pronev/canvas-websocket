<script lang="ts">
	import { onMount } from 'svelte';

	export let roomId;

	let isSocketReady:boolean = false;
	let isCanvasReady:boolean = true;
	let isMouseDown:boolean = false;
	let socket:WebSocket = new WebSocket(`ws://127.0.0.1:4000/${roomId}`);
	let canvas;
	let ctx;
	let dataToSend = [];
	let size:number = 5;
	let lineCap:string = 'round';
	let color:string = 'rgb(0,0,0)';
	let brushes:string[] = ['butt', 'round', 'square'];

	socket.onopen = function() {
		isSocketReady = true;
	};

	socket.onmessage = async (event) => {
		await wait();
		draw(event.data);
	};

	const wait = async () => {
		try {
			return new Promise((resolve) => drawReadyCheck(resolve));
		} catch (error) {
			console.log(error);
		}
	};

	function drawReadyCheck(resolve) {
		if (isCanvasReady) {
			resolve();
		} else {
			setTimeout(function() {drawReadyCheck(resolve)}, 100);
		}
	} 

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	function getMousePos(canvas, evt) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	function mouseDown(evt) {
		isMouseDown = true;
		isCanvasReady = false;
		const currentPosition = getMousePos(canvas, evt);
		ctx.moveTo(currentPosition.x, currentPosition.y);
		ctx.beginPath();
		ctx.lineCap = lineCap;
		ctx.lineWidth  = size;
		ctx.strokeStyle = color;
	}

	function mouseMove(evt) {
		if (isMouseDown) {
			const currentPosition = getMousePos(canvas, evt);
			ctx.lineTo(currentPosition.x, currentPosition.y);
			ctx.stroke();
			store(currentPosition.x, currentPosition.y, size, color, lineCap);
		}
	}

	function mouseUp() {
		isMouseDown = false;
		isCanvasReady = true;
		sendData();
	}

	function store(x, y, s, c, l) {
		let line = {
			'x': x,
			'y': y,
			'size': s,
			'color': c,
			'lineCap': l
		}
		dataToSend.push(line);
	}

	function sendData():void {
		if (isSocketReady) {
			socket.send(JSON.stringify(dataToSend));
			dataToSend = [];
		}
	}

	function draw(data) {
		isCanvasReady = false;
		let lines = JSON.parse(data);
		if (lines.length === 1) {
			ctx.beginPath();
			ctx.moveTo(lines[0].x, lines[0].y);
			ctx.lineCap = lines[0].lineCap;
			ctx.lineWidth  = lines[0].size;
			ctx.strokeStyle = lines[0].color;
			ctx.lineTo(lines[0].x, lines[0].y);
			ctx.stroke();
		} else {
			for (let i = 1; i < lines.length; i++) {
				ctx.beginPath();
				ctx.moveTo(lines[i-1].x, lines[i-1].y);
				ctx.lineCap = lines[i].lineCap;
				ctx.lineWidth  = lines[i].size;
				ctx.strokeStyle = lines[i].color;
				ctx.lineTo(lines[i].x, lines[i].y);
				ctx.stroke();
			}
		}
		ctx.lineCap = lineCap;
		ctx.lineWidth  = size;
		ctx.strokeStyle = color;
		isCanvasReady = true;
	}

</script>

<form>
	<label>
		Color:
		<input type='color' bind:value={color}>
	</label>
	<label>
		Size:
		<input type='number' min='1' bind:value={size}>
	</label>
	<label>
		Brush:
		<select bind:value={lineCap}>
			{#each brushes as brush}
				<option value={brush}>
					{brush}
				</option>
			{/each}
		</select>
	</label>
</form>
<canvas 
	bind:this={canvas}
	on:mousedown={mouseDown}
	on:mousemove={mouseMove}
	on:mouseup={mouseUp}
	width={1024}
	height={480}
></canvas>
<div>
	Room ID: {roomId}
</div>

<style>

	canvas {
		cursor: crosshair;
		border: 1px solid #ccc;
    border-radius: 2px;
		margin-top: 10px;
	}

	input {
		width: 50px;
	}

	input, select {
		height: 26px;
		margin-right: 10px;
	}

</style>