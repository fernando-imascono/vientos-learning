# The illegible PDF

One of the required demo scenarios is: _upload a valid SOP and an illegible
PDF; the first becomes consultable, the second shows an error, and neither
creates a purchase._

You need a PDF with no extractable text. Pick whichever is easiest:

1. **A photo of paper.** Photograph or screenshot a printed page, then export
   the image to PDF. There is no text layer, so extraction fails or returns
   nothing usable.
2. **A blank PDF.** Export an empty document. Extraction succeeds and returns
   nothing — which your code must also treat as a failure, with a reason.
3. **A corrupt PDF.** `head -c 2000 purchasing-sop.pdf > truncated.pdf`.
   The parser errors out.

Case 2 is the interesting one: it is the failure that is easiest to let through
by accident. "Extraction returned 0 characters" has to become a `failed`
document with a readable reason, not an `available` document with an empty SOP.
