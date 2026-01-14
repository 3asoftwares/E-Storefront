export const GET_TICKETS_QUERY = `
  query GetTickets($page: Int, $limit: Int, $status: String, $priority: String, $category: String, $customerId: String, $search: String) {
    tickets(page: $page, limit: $limit, status: $status, priority: $priority, category: $category, customerId: $customerId, search: $search) {
      tickets {
        id
        ticketId
        subject
        description
        category
        priority
        status
        customerName
        customerEmail
        customerId
        assignedTo
        assignedToName
        resolution
        createdAt
        updatedAt
        resolvedAt
        closedAt
      }
      pagination {
        page
        limit
        total
        pages
      }
    }
  }
`;

export const GET_MY_TICKETS_QUERY = `
  query GetMyTickets($page: Int, $limit: Int) {
    myTickets(page: $page, limit: $limit) {
      tickets {
        id
        ticketId
        subject
        description
        category
        priority
        status
        customerName
        customerEmail
        customerId
        assignedTo
        assignedToName
        resolution
        createdAt
        updatedAt
        resolvedAt
        closedAt
      }
      pagination {
        page
        limit
        total
        pages
      }
    }
  }
`;

export const GET_TICKET_QUERY = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      ticketId
      subject
      description
      category
      priority
      status
      customerName
      customerEmail
      customerId
      assignedTo
      assignedToName
      resolution
      attachments
      comments {
        userId
        userName
        userRole
        message
        isInternal
        createdAt
      }
      createdAt
      updatedAt
      resolvedAt
      closedAt
    }
  }
`;

export const CREATE_TICKET_MUTATION = `
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id
      ticketId
      subject
      description
      category
      priority
      status
      customerName
      customerEmail
      customerId
      createdAt
    }
  }
`;

export const ADD_TICKET_COMMENT_MUTATION = `
  mutation AddTicketComment($input: AddTicketCommentInput!) {
    addTicketComment(input: $input) {
      id
      ticketId
      comments {
        userId
        userName
        userRole
        message
        isInternal
        createdAt
      }
    }
  }
`;
