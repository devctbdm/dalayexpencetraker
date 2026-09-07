export async function responseMessage(response: Response) {
  try {
    const body = (await response.json()) as { error?: string; message?: string }
    return body.error ?? body.message ?? "Something went wrong. Please try again."
  } catch {
    return "Something went wrong. Please try again."
  }
}
