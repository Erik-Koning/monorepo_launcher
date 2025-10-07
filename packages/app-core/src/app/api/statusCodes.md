# HTTP Status Codes

HTTP status codes are responses issued by a server in response to a client's request made to the server. Here are some of the most common status codes:

## 1xx Informational

- `100 Continue`: The server has received the request headers, and the client should proceed to send the request body.
- `101 Switching Protocols`: The requester has asked the server to switch protocols and the server has agreed to do so.
- `102 Processing (WebDAV)`: The server has received and is processing the request, but no response is available yet.
- `103 Early Hints`: Used to return some response headers before final HTTP message.

## 2xx Success

- `200 OK`: The request has succeeded. The information returned with the response depends on the method used in the request.
- `201 Created`: The request has been fulfilled and has resulted in a new resource being created.
- `202 Accepted`: The request has been accepted for processing, but the processing has not been completed.
- `203 Non-Authoritative Information`: The server is a transforming proxy that received a 200 OK from its origin but is returning a modified version of the origin's response.
- `204 No Content`: The server successfully processed the request and is not returning any content.
- `205 Reset Content`: The server successfully processed the request, but is not returning any content and requires that the requester reset the document view.
- `206 Partial Content`: The server is delivering only part of the resource due to a range header sent by the client.
- `207 Multi-Status (WebDAV)`: Provides status for multiple independent operations.
- `208 Already Reported (WebDAV)`: Used inside a DAV: propstat response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.

## 3xx Redirection

- `300 Multiple Choices`: The request has more than one possible response. The user-agent or user should choose one of them.
- `301 Moved Permanently`: This response code means that the URI of the requested resource has been changed permanently.
- `302 Found`: This response code means that the URI of the requested resource has been changed temporarily.
- `303 See Other`: The server is redirecting to a different URI, which is intended to provide an indirect response to the original request.
- `304 Not Modified`: Indicates that the resource has not been modified since the last request.
- `305 Use Proxy`: Deprecated. The requested resource is available only through a proxy, the address for which is provided in the response.
- `307 Temporary Redirect`: The server is redirecting to a different URI, which should be used again for the next request.
- `308 Permanent Redirect`: This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header.

## 4xx Client Error

- `400 Bad Request`: The server cannot or will not process the request due to something that is perceived to be a client error.
- `401 Unauthorized`: Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
- `402 Payment Required`: Reserved for future use.
- `403 Forbidden`: The server understood the request but refuses to authorize it.
- `404 Not Found`: The server can't find the requested resource.
- `405 Method Not Allowed`: The request method is known by the server but has been disabled and cannot be used.
- `406 Not Acceptable`: The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers.
- `407 Proxy Authentication Required`: The client must first authenticate itself with the proxy.
- `408 Request Timeout`: The server timed out waiting for the request.

## 5xx Server Error

- `500 Internal Server Error`: The server has encountered a situation it doesn't know how to handle.
- `501 Not Implemented`: The request method is not supported by the server and cannot be handled.
- `502 Bad Gateway`: The server was acting as a gateway or proxy and received an invalid response from the upstream server.
- `503 Service Unavailable`: The server is not ready to handle the request.
- `504 Gateway Timeout`: The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
- `505 HTTP Version Not Supported`: The server does not support the HTTP protocol version used in the request.
- `506 Variant Also Negotiates`: Transparent content negotiation for the request results in a circular reference.
- `507 Insufficient Storage (WebDAV)`: The server is unable to store the representation needed to complete the request.
- `508 Loop Detected (WebDAV)`: The server detected an infinite loop while processing the request.
