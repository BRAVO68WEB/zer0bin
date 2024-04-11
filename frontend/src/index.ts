import "no-darkreader"

import { marked } from "marked"
import JSConfetti from "js-confetti"
import Scrollbar from "smooth-scrollbar"

import "./icons"
import hljs from "highlight.js/lib/common"
// import hljs from "../min/highlight.min"

import "../min/rosepine.min.css"
import { toggleHiddenIcon } from "./icons"

console.log(`
▀▀█ █▀▀ █▀▀█ █▀▀█ █▀▀▄ ▀ █▀▀▄ 
▄▀  █▀▀ █▄▄▀ █▄▀█ █▀▀▄ █ █  █ 
▀▀▀ ▀▀▀ ▀ ▀▀ █▄▄█ ▀▀▀  ▀ ▀  ▀ 
Thank you for using zer0bin!
If you're reading this message, why not help with development?
https://github.com/BRAVO68WEB/zer0bin
`)

let rawContent = ""
let buttonPaneHidden = false
let isMarkdown = false
let singleView = false

const jsConfetti = new JSConfetti()

const lineNumbers = <HTMLElement>document.querySelector(".line-numbers")
const wrapper = <HTMLPreElement>document.querySelector(".wrapper")
const buttonWrapper = <HTMLPreElement>document.querySelector(".button-wrapper")
const editor = <HTMLTextAreaElement>document.getElementById("text-area")
const codeViewPre = <HTMLPreElement>document.getElementById("code-view-pre")
const codeView = <HTMLElement>document.getElementById("code-view")
const messages = <HTMLElement>document.getElementById("messages")
const viewCounterLabel = <HTMLSpanElement>(
	document.getElementById("viewcounter-label")
)
const viewCounter = <HTMLSpanElement>(
	document.getElementById("viewcounter-count")
)
const saveButton = <HTMLButtonElement>document.getElementById("save-button")
const newButton = <HTMLButtonElement>document.getElementById("new-button")
const copyButton = <HTMLButtonElement>document.getElementById("copy-button")
const hideButton = <HTMLButtonElement>document.getElementById("hide-button")
const shareButton = <HTMLButtonElement>document.getElementById("share-button")
const rawButton = <HTMLButtonElement>document.getElementById("open-raw-button")
const markdownButton = <HTMLButtonElement>(
	document.getElementById("markdown-button")
)
const singleViewButton = <HTMLButtonElement>(
	document.getElementById("single-view-button")
)

function hide(element: HTMLElement) {
	element.style.visibility = "hidden"
	element.style.opacity = "0"
}

function show(element: HTMLElement) {
	element.style.visibility = "visible"
	element.style.opacity = "1"
}

function disable(element: HTMLButtonElement) {
	element.disabled = true
}

function enable(element: HTMLButtonElement) {
	element.disabled = false
}

async function postPaste(content: string, callback: Function) {
	const payload = { content, single_view: singleView }
	await fetch(`${API_URL}/p/n`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data["success"]) {
				callback(null, data)
				return
			}

			callback(data || { data: { message: "An unkown error occured!" } })
		})
		.catch(() => {
			callback({
				data: { message: "An API error occurred, please try again." },
			})
		})
}

async function getPaste(id: string, callback: Function) {
	await fetch(`${API_URL}/p/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		referrerPolicy: "no-referrer",
	})
		.then((response) => response.json())
		.then((data) => {
			if (data["success"]) {
				callback(null, data)
				return
			}
			callback(data || { data: { message: "An unkown error occured!" } })
		})
		.catch(() => {
			callback({
				data: { message: "An API error occurred, please try again." },
			})
		})
}

function newPaste() {
	Scrollbar.destroyAll()

	lineNumbers.innerHTML = "&gt;"

	enable(saveButton)
	disable(newButton)
	disable(copyButton)
	disable(shareButton)
	disable(rawButton)
	enable(singleViewButton)

	editor.value = ""
	rawContent = ""

	wrapper.classList.add("text-area-proper")
	show(editor)
	editor.disabled = false
	hide(codeViewPre)
	hide(viewCounterLabel)
	hide(viewCounter)
	viewCounterLabel.style.display = "none"
	viewCounter.style.display = "none"
}

function addMessage(message: string) {
	let msg = document.createElement("li")
	msg.innerHTML = message
	messages.insertBefore(msg, messages.firstChild)

	setTimeout(function () {
		msg.classList.add("fadeOut"),
			function () {
				msg.remove()
			}
	}, 3000)
}

function viewPaste(content: string, views: string, singleView: boolean) {
	lineNumbers.innerHTML = ""
	if (
		content.startsWith("---") ||
		content.startsWith("md ") ||
		content.startsWith("md\n")
	) {
		codeView.innerHTML = marked.parse(content.substring(3))
	} else {
		for (let i = 1; i <= content.split("\n").length; i++) {
			lineNumbers.innerHTML = lineNumbers.innerHTML + `${i}<br>`
		}
		codeView.innerHTML = hljs.highlightAuto(content).value
	}

	if (singleView) {
		show(singleViewButton.firstElementChild as HTMLElement)
		singleViewButton.lastElementChild.classList.add("fire")
		addMessage("This is a single-view paste!")
	}

	enable(shareButton)
	shareButton.addEventListener("click", function () {
		const url = window.location.toString()
		if (navigator.canShare) {
			navigator.share({
				title: "zer0bin paste",
				url: url,
			})
		} else {
			navigator.clipboard.writeText(url)
			addMessage("Copied URL to clipboard!")
		}
	})

	disable(saveButton)
	disable(markdownButton)
	enable(newButton)
	enable(copyButton)
	disable(singleViewButton)
	enable(rawButton)
	hide(editor)
	show(codeViewPre)
	show(viewCounterLabel)
	show(viewCounter)
	viewCounterLabel.style.display = null
	viewCounter.style.display = null

	viewCounter.textContent = views

	try {
		wrapper.classList.remove("text-area-proper")
	} catch (error) {}

	Scrollbar.init(document.querySelector(".scrollbar-container"))
}

async function savePaste() {
	if (editor.value === "") {
		return
	}
	const val: string = editor.value?.toString()!

	await postPaste(val, function (err, res) {
		if (err) {
			addMessage(err["data"]["message"])
		} else {
			window.history.pushState(null, "", `/${res["data"]["id"]}`)

			rawContent = res["data"]["content"]
			viewPaste(rawContent, "0", res["data"]["single_view"])

			const rand = Math.floor(Math.random() * 4) + 1

			if (rand === 1) {
				jsConfetti.addConfetti({
					confettiColors: [
						"#eb6f92",
						"#f6c177",
						"#ebbcba",
						"#31748f",
						"#9ccfd8",
						"#c4a7e7",
					],
				})
			} else if (rand === 2) {
				jsConfetti.addConfetti({
					emojis: ["🦀"],
				})
			} else if (rand === 3) {
				jsConfetti.addConfetti({
					emojis: ["🐈", "🧶", "📦"],
				})
			}
			else {
				jsConfetti.addConfetti({
					emojis: [
						"🎉",
						"🎊",
					],
				})
			}
		}
	})
}

async function duplicatePaste() {
	const content = rawContent
	window.history.pushState(null, "", "/")
	newPaste()

	rawContent = content
	editor.value = content
}

function toggleMarkdown() {
	let val = editor.value
	markdownButton.lastElementChild.classList.toggle("markdown")
	if (isMarkdown) {
		isMarkdown = false
		val = val.substring(val.indexOf("\n") + 1)
	} else {
		isMarkdown = true
		val = `---\n${val}`
	}
}

saveButton.addEventListener("click", async function () {
	await savePaste()
})

document.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.code === "KeyS") {
		e.preventDefault()
		savePaste()
	} else if (e.ctrlKey && e.code === "KeyN") {
		e.preventDefault()
		newPaste()
	} else if (e.ctrlKey && e.code === "KeyD") {
		e.preventDefault()
		duplicatePaste()
	} else if (e.ctrlKey && e.code === "KeyM") {
		e.preventDefault()
		toggleMarkdown()
	} else if (e.ctrlKey && e.code === "KeyX") {
		e.preventDefault()
		rawUrlCopyToClipboard()
	}
})

editor.addEventListener(
	"keydown",
	function (e: KeyboardEvent) {
		if (e.code == "Tab") {
			e.preventDefault()

			let start: number = this.selectionStart
			let end: number = this.selectionEnd

			this.value =
				this.value.substring(0, start) +
				"\t" +
				this.value.substring(end)

			this.selectionStart = this.selectionEnd = start + 1
		}
	},
	false
)

copyButton.addEventListener("click", async function () {
	await duplicatePaste()
})



newButton.addEventListener("click", function () {
	window.location.href = "/"
})

hideButton.addEventListener("click", function () {
	if (!buttonPaneHidden) {
		buttonPaneHidden = true
		hide(buttonWrapper)
	} else {
		buttonPaneHidden = false
		show(buttonWrapper)
	}

	toggleHiddenIcon(buttonPaneHidden)
})

markdownButton.addEventListener("click", function () {
	toggleMarkdown()
})

singleViewButton.addEventListener("click", function () {
	singleViewButton.lastElementChild.classList.toggle("fire")
	if (singleView) {
		singleView = false
		hide(singleViewButton.firstElementChild as HTMLElement)
	} else {
		singleView = true
		show(singleViewButton.firstElementChild as HTMLElement)
	}
})

async function handlePopstate() {
	const path = window.location.pathname

	if (path == "/") {
		newPaste()
	} else {
		const split = path.split("/")
		const id = split[split.length - 1]

		await getPaste(id, function (err, res) {
			if (err) {
				window.history.pushState(null, "", `/`)
				newPaste()
			} else {
				rawContent = res["data"]["content"]
				viewPaste(
					rawContent,
					res["data"]["views"].toString(),
					res["data"]["single_view"]
				)
			}
		})
	}
}

window.addEventListener("popstate", async () => {
	await handlePopstate()
})

document.addEventListener(
	"DOMContentLoaded",
	async () => {
		await handlePopstate()
	},
	false
)

function rawUrlCopyToClipboard(){
	const rawUrl = `${API_URL}/p/r/${window.location.pathname.split("/")[1]}`
	navigator.clipboard.writeText(rawUrl)
    addMessage("Copied raw URL to clipboard!")
}

rawButton.addEventListener("click", function () {
	rawUrlCopyToClipboard()
})