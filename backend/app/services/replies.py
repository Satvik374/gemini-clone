"""Reply text for the reconstructed service.

There is no model behind this API. Replies are composed locally from the prompt so
the streaming contract, turn ordering and storage can be exercised end to end
without spending anyone's credits. Every reply states that it is a mock.
"""

import hashlib

_OPENERS = [
    "Here is a first pass.",
    "Let me take that apart.",
    "Short answer first, then the detail.",
    "That is a reasonable ask.",
]

_SECTIONS = {
    "code": (
        "A workable shape for that: keep the boundary at one seam, pass the data in, "
        "and return a value rather than mutating a shared object."
    ),
    "plan": (
        "Break it into three steps you can finish in one sitting, and write down the "
        "check you will run after each one."
    ),
    "write": (
        "Lead with the conclusion, keep one idea per paragraph, and cut any sentence "
        "that only restates the previous one."
    ),
    "default": (
        "The useful constraint here is scope: decide what this is not going to do, "
        "then let the rest follow from that."
    ),
}


def _bucket(prompt: str) -> str:
    low = prompt.lower()
    for key in ("code", "function", "bug", "api", "test"):
        if key in low:
            return "code"
    for key in ("plan", "schedule", "week", "steps"):
        if key in low:
            return "plan"
    for key in ("write", "email", "draft", "summar"):
        if key in low:
            return "write"
    return "default"


def reply_for(prompt: str) -> str:
    """Deterministic for a given prompt, so parity tests can assert on it."""
    digest = hashlib.sha256(prompt.strip().lower().encode("utf-8")).hexdigest()
    opener = _OPENERS[int(digest[:2], 16) % len(_OPENERS)]
    body = _SECTIONS[_bucket(prompt)]
    topic = prompt.strip().splitlines()[0][:120]
    return (
        f"{opener} You asked about: {topic}\n\n"
        f"{body}\n\n"
        "This reply comes from the reconstructed backend, not a language model — "
        "the endpoint, streaming frames and stored turns are real."
    )


def stream_chunks(text: str, size: int = 6) -> list[str]:
    """Split on word boundaries into stable chunks for SSE frames."""
    words = text.split(" ")
    return [" ".join(words[i : i + size]) + (" " if i + size < len(words) else "") for i in range(0, len(words), size)]
